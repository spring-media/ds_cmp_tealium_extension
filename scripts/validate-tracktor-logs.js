#!/usr/bin/env node
/**
 * TRACKTOR Test Artifact Validator
 * 
 * Validates JSONL tracking logs from TRACKTOR e2e tests
 * Usage: node scripts/validate-tracktor-logs.js <path-to-jsonl-file>
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Expected event configurations
const EXPECTED_EVENTS = {
  'remote_config_fetched': {
    type: 'event',
    required_params: ['event_name', 'event_action', 'event_type', 'event_label']
  },
  'home': {
    type: 'view',
    required_params: ['page_name', 'page_document_type', 'page_channel1', 'tracking_id']
  },
  'article': {
    type: 'view',
    required_params: ['page_name', 'assetid', 'page_headline', 'page_document_type', 'tracking_id']
  },
  'media_ready': {
    type: 'event',
    required_params: ['media_id', 'media_headline', 'event_name']
  },
  'media_play': {
    type: 'event',
    required_params: ['media_id', 'media_headline', 'event_name']
  },
  'checkout_success': {
    type: 'event',
    required_params: ['event_name', 'order_id', 'order_total']
  }
};

// Validation rules
const VALIDATION_RULES = {
  tracking_id_unique: true,
  required_vendors: ['tealium'],
  max_event_gap_seconds: 60, // Max time between events
  min_events: 1
};

/**
 * Parse JSONL or JSON array file
 */
function parseJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  
  // Try parsing as JSON array first
  if (content.startsWith('[')) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse as JSON array: ${error.message}`);
    }
  }
  
  // Otherwise parse as JSONL (newline-delimited JSON)
  const lines = content.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Failed to parse line ${index + 1}: ${error.message}`);
    }
  });
}

/**
 * Validate event structure
 */
function validateEvent(event, index) {
  const errors = [];
  const warnings = [];

  // Check required fields
  if (!event.type) {
    errors.push(`Event ${index + 1}: Missing 'type' field`);
  }
  
  if (!event.name) {
    errors.push(`Event ${index + 1}: Missing 'name' field`);
  }
  
  if (!event.params) {
    errors.push(`Event ${index + 1}: Missing 'params' field`);
    return { errors, warnings };
  }
  
  if (!event.timestamp) {
    warnings.push(`Event ${index + 1}: Missing 'timestamp' field`);
  }
  
  if (!event.vendor) {
    warnings.push(`Event ${index + 1}: Missing 'vendor' field`);
  }

  // Validate against expected schema
  const expectedEvent = EXPECTED_EVENTS[event.name];
  if (expectedEvent) {
    // Check type matches
    if (event.type !== expectedEvent.type) {
      errors.push(`Event ${index + 1} (${event.name}): Expected type '${expectedEvent.type}', got '${event.type}'`);
    }
    
    // Check required parameters
    expectedEvent.required_params.forEach(param => {
      if (!(param in event.params)) {
        errors.push(`Event ${index + 1} (${event.name}): Missing required param '${param}'`);
      } else if (!event.params[param] || event.params[param] === '') {
        warnings.push(`Event ${index + 1} (${event.name}): Param '${param}' is empty`);
      }
    });
  } else {
    warnings.push(`Event ${index + 1}: Unknown event type '${event.name}'`);
  }

  return { errors, warnings };
}

/**
 * Validate event sequence
 */
function validateSequence(events) {
  const errors = [];
  const warnings = [];
  const trackingIds = new Set();

  events.forEach((event, index) => {
    // Check for duplicate tracking IDs (they should be unique)
    if (event.params && event.params.tracking_id) {
      const trackingId = event.params.tracking_id;
      if (VALIDATION_RULES.tracking_id_unique && trackingIds.has(trackingId)) {
        warnings.push(`Event ${index + 1}: Duplicate tracking_id '${trackingId}'`);
      }
      trackingIds.add(trackingId);
    }

    // Check time gaps between events
    if (index > 0 && event.timestamp && events[index - 1].timestamp) {
      const gap = event.timestamp - events[index - 1].timestamp;
      if (gap > VALIDATION_RULES.max_event_gap_seconds) {
        warnings.push(`Event ${index + 1}: Large time gap (${gap.toFixed(1)}s) from previous event`);
      }
      if (gap < 0) {
        errors.push(`Event ${index + 1}: Timestamp is before previous event (time travel detected!)`);
      }
    }

    // Check vendor data
    if (event.vendor) {
      VALIDATION_RULES.required_vendors.forEach(vendor => {
        if (!(vendor in event.vendor)) {
          warnings.push(`Event ${index + 1}: Missing vendor '${vendor}'`);
        }
      });
    }
  });

  return { errors, warnings };
}

/**
 * Generate statistics
 */
function generateStats(events) {
  const stats = {
    total_events: events.length,
    event_types: {},
    view_events: 0,
    link_events: 0,
    unique_tracking_ids: new Set(),
    time_range: null
  };

  events.forEach(event => {
    // Count by type
    if (event.type) {
      if (event.type === 'view') stats.view_events++;
      if (event.type === 'link' || event.type === 'event') stats.link_events++;
    }

    // Count by name
    if (event.name) {
      stats.event_types[event.name] = (stats.event_types[event.name] || 0) + 1;
    }

    // Collect tracking IDs
    if (event.params && event.params.tracking_id) {
      stats.unique_tracking_ids.add(event.params.tracking_id);
    }
  });

  // Calculate time range
  const timestamps = events.map(e => e.timestamp).filter(Boolean);
  if (timestamps.length > 0) {
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    stats.time_range = {
      start: new Date(minTime * 1000).toISOString(),
      end: new Date(maxTime * 1000).toISOString(),
      duration_seconds: (maxTime - minTime).toFixed(2)
    };
  }

  stats.unique_tracking_ids = stats.unique_tracking_ids.size;

  return stats;
}

/**
 * Print results
 */
function printResults(results) {
  console.log('\n' + colors.blue + '═'.repeat(60) + colors.reset);
  console.log(colors.blue + '  TRACKTOR Validation Report' + colors.reset);
  console.log(colors.blue + '═'.repeat(60) + colors.reset + '\n');

  // File info
  console.log(colors.cyan + '📄 File:' + colors.reset, results.file);
  console.log(colors.cyan + '📊 Total Events:' + colors.reset, results.stats.total_events);
  console.log('');

  // Statistics
  console.log(colors.yellow + '📈 Statistics:' + colors.reset);
  console.log('  View Events:', results.stats.view_events);
  console.log('  Link/Action Events:', results.stats.link_events);
  console.log('  Unique Tracking IDs:', results.stats.unique_tracking_ids);
  
  if (results.stats.time_range) {
    console.log('  Time Range:', results.stats.time_range.start, '→', results.stats.time_range.end);
    console.log('  Duration:', results.stats.time_range.duration_seconds + 's');
  }
  console.log('');

  // Event type breakdown
  console.log(colors.yellow + '📋 Event Types:' + colors.reset);
  Object.entries(results.stats.event_types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`);
    });
  console.log('');

  // Errors
  if (results.errors.length > 0) {
    console.log(colors.red + '❌ Errors (' + results.errors.length + '):' + colors.reset);
    results.errors.forEach(error => console.log('  ' + colors.red + '•' + colors.reset, error));
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(colors.yellow + '⚠️  Warnings (' + results.warnings.length + '):' + colors.reset);
    results.warnings.forEach(warning => console.log('  ' + colors.yellow + '•' + colors.reset, warning));
    console.log('');
  }

  // Summary
  console.log(colors.blue + '━'.repeat(60) + colors.reset);
  if (results.errors.length === 0) {
    console.log(colors.green + '✅ Validation PASSED' + colors.reset);
    if (results.warnings.length > 0) {
      console.log(colors.yellow + `   (with ${results.warnings.length} warning${results.warnings.length > 1 ? 's' : ''})` + colors.reset);
    }
  } else {
    console.log(colors.red + '❌ Validation FAILED' + colors.reset);
    console.log(colors.red + `   ${results.errors.length} error${results.errors.length > 1 ? 's' : ''} found` + colors.reset);
  }
  console.log(colors.blue + '━'.repeat(60) + colors.reset + '\n');
}

/**
 * Main validation function
 */
function validateArtifact(filePath) {
  const results = {
    file: filePath,
    errors: [],
    warnings: [],
    stats: {}
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    results.errors.push(`File not found: ${filePath}`);
    return results;
  }

  try {
    // Parse JSONL
    const events = parseJSONL(filePath);
    
    // Check minimum events
    if (events.length < VALIDATION_RULES.min_events) {
      results.errors.push(`Too few events: ${events.length} (minimum: ${VALIDATION_RULES.min_events})`);
      return results;
    }

    // Validate each event
    events.forEach((event, index) => {
      const validation = validateEvent(event, index);
      results.errors.push(...validation.errors);
      results.warnings.push(...validation.warnings);
    });

    // Validate sequence
    const sequenceValidation = validateSequence(events);
    results.errors.push(...sequenceValidation.errors);
    results.warnings.push(...sequenceValidation.warnings);

    // Generate statistics
    results.stats = generateStats(events);

  } catch (error) {
    results.errors.push(`Failed to process file: ${error.message}`);
  }

  return results;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(colors.red + '❌ Error: File path required' + colors.reset);
    console.error('');
    console.error('Usage: node validate-tracktor-logs.js <path-to-jsonl-file>');
    console.error('');
    console.error('Example:');
    console.error('  node validate-tracktor-logs.js tracktor-artifacts/abc123/tracked_entries.jsonl');
    process.exit(1);
  }

  const filePath = args[0];
  console.log(colors.blue + '🔍 Validating TRACKTOR artifacts...' + colors.reset);
  
  const results = validateArtifact(filePath);
  printResults(results);

  // Exit with error code if validation failed
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { validateArtifact, parseJSONL };
