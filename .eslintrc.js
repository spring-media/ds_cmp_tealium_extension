module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true,
        'jest/globals': true
    },
    'extends': 'eslint:recommended',
    'plugins': ['jest'],
    'parserOptions': {
        'ecmaVersion': 13
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-console': 1
    }
};
