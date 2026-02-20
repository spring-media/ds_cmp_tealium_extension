import { Variable } from '../../tealiumdeployment/Variable';
import { Tag } from '../../tealiumdeployment/Tag';
import { TagDataMapping } from '../../tealiumdeployment/TealiumAPI';

/**
 * Create a data mapping from a Variable object
 * ✅ Type-safe, no hardcoded strings
 */
export function mapVariable(variable: Variable, mappings: string[]): TagDataMapping {
    return {
        variable: variable.name,
        type: variable.type,
        mappings: mappings
    };
}

/**
 * Get scope string from Tag objects
 * ✅ Type-safe, no hardcoded IDs
 */
export function tagScope(...tags: Tag[]): string {
    return tags.map(tag => tag.id).join(',');
}
