const gulp            = require('gulp'),
      ClosureCompiler = require('google-closure-compiler').gulp(),
      postProcessor   = require('es2-postprocessor'),
      gulpDPZ         = require('gulp-diamond-princess-zoning'),
      tempDir         = require('os').tmpdir() + '/ReRE.js',
      fs              = require( 'fs' ),
      package         = require('./package.json'),
      aboutReREjs     = 'v' + ( package.version || '0.0' ) + '(' + ( package.homepage || '?' ).split( '#' )[ 0 ] + ')';

const dontEditMessage = '// THIS SCRIPT IS GENERATED BY "##". DO NOT EDIT!\n\n';

gulp.task( 'data',
    function( cb ){
        // Case folding
        var fileName = './src/js-tools/1_generateUnicodeFoldMap.js';

        fs.writeFileSync(
            './src/js/3_data.generated/1_unicodeFoldMap.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Case folding Legacy
        fileName = './src/js-tools/2_generateUnicodeFoldMapLegacy.js';

        fs.writeFileSync(
            './src/js/3_data.generated/2_unicodeFoldMapLegacy.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Unicode Category
        fileName = './src/js-tools/3_generateUnicodeCategory.js';

        fs.writeFileSync(
            './src/js/3_data.generated/3_unicodeCategory.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Unicode Property
        var fileName = './src/js-tools/4_generateUnicodeProperty.js';

        fs.writeFileSync(
            './src/js/3_data.generated/4_unicodeProperty.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Unicode Property Alias
        var fileName = './src/js-tools/5_generateUnicodePropertyAlias.js';

        fs.writeFileSync(
            './src/js/3_data.generated/5_unicodePropertyAlias.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Unicode Property Value Alias
        var fileName = './src/js-tools/6_generateUnicodePropertyValueAlias.js';

        fs.writeFileSync(
            './src/js/3_data.generated/6_unicodePropertyValueAlias.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // Unicode Script
        var fileName = './src/js-tools/7_generateUnicodeScript.js';

        fs.writeFileSync(
            './src/js/3_data.generated/7_unicodeScript.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // 
        var fileName = './src/js-tools/8_generateCharSetWordAndUnicodeWord.js';

        fs.writeFileSync(
            './src/js/4_char-class/3_ascii.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        //
        var fileName = './src/js-tools/9_generateCharSetIdStartAndIdContinue';

        fs.writeFileSync(
            './src/js/5_syntax/3_charSetIdStartAndIdContinue.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        // 
        var fileName = './src/js-tools/A_generateExterns.js';

        fs.writeFileSync(
            './src/js-externs/externs.generated.js',
            dontEditMessage.replace( '##', fileName ) + require( fileName )()
        );
        cb();
    }
);


gulp.task( '__compile', gulp.series(
    function(){
        return gulp.src(
            [
                './src/js/**/*.js'
            ]
        ).pipe(
            gulpDPZ(
                {
                    // labelGlobal        : 'global',
                    labelPackageGlobal : 'moduleGlobal', // hack
                    // labelModuleGlobal  : 'moduleGlobal',
                    packageGlobalArgs  : [
                        isNodejsLibrary ? 'global,String,Math,Infinity,undefined' : 'global,RegExp,String,Math,Infinity,undefined',
                        isNodejsLibrary ? 'this,String,Math,1/0,void 0' : 'this,this.RegExp,String,Math,1/0,void 0'
                    ],
                    basePath : [ './src/js/' ]
                }
            )
        ).pipe(
            ClosureCompiler(
                {
                    externs           : [
                        './node_modules/google-closure-compiler/contrib/nodejs/globals.js',
                        './src/js-externs/externs.generated.js'
                    ],
                    define            : [
                        'DEFINE_REGEXP_COMPAT__DEBUG='  + ( strCompileType !== 'release' && clientMinEsVersion !== 2 ),
                        'DEFINE_REGEXP_COMPAT__MINIFY=' + ( strCompileType !== 'develop' && !isNodejsLibrary ),
                        'DEFINE_REGEXP_COMPAT__NODEJS=' + isNodejsLibrary,
                        'DEFINE_REGEXP_COMPAT__CLIENT_MIN_ES_VERSION=' + clientMinEsVersion,
                        'DEFINE_REGEXP_COMPAT__ES_FEATURE_VERSION='    + ecmaFeatureVersion,
                        'DEFINE_REGEXP_COMPAT__EXPORT_BY_RETURN='      + !isNodejsLibrary
                    ],
                    compilation_level : strCompileType === 'develop' && clientMinEsVersion !== 2 ? 'SIMPLE' : 'ADVANCED',
                    // compilation_level : 'WHITESPACE_ONLY',
                    env               : 'CUSTOM',
                    formatting        : strCompileType !== 'release' ? 'PRETTY_PRINT' : 'SINGLE_QUOTES',
                    warning_level     : 'VERBOSE',
                    language_in       : 'ECMASCRIPT3',
                    language_out      : 'ECMASCRIPT3',
                    output_wrapper    : '// ReRE.js for ' +
                        (
                            isNodejsLibrary ? 'Node' : 'ES' + clientMinEsVersion
                        )
                        + '[' + strCompileType + '], Compatible:ES' + ecmaFeatureVersion + ', ' + aboutReREjs + '\n' +
                        (
                            isNodejsLibrary ? '%output%' :
                            strCompileType === 'develop' ?
                                'var RegExpCompat=(function(){%output%})();' :
                                'var RegExpCompat=%output%'
                        ),
                    js_output_file    : isNodejsLibrary ?
                                            'index' + ( strCompileType !== 'release' ? '.' + strCompileType : '' ) + '.js' :
                                        clientMinEsVersion !== 2 ?
                                            'ReRE.es' + clientMinEsVersion + '.' + ecmaFeatureVersion + '.' + strCompileType + '.js' :
                                            'ReRE.es2.js'
                }
            )
        ).pipe( gulp.dest( isNodejsLibrary ? 'lib' : clientMinEsVersion !== 2 ? 'dist/' + strCompileType : tempDir ) );
    },
    function( cb ){
        if( clientMinEsVersion !== 2 || isNodejsLibrary ){
            return cb();
        };
        return gulp.src(
            [
                tempDir + '/ReRE.es2.js'
            ]
        ).pipe(
            postProcessor.gulp(
                {
                    minIEVersion    : 5,
                    minOperaVersion : 7,
                    minGeckoVersion : 0.6
                }
            )
        ).pipe(
            ClosureCompiler(
                {
                    compilation_level : 'WHITESPACE_ONLY',
                    formatting        : strCompileType !== 'release' ? 'PRETTY_PRINT' : 'SINGLE_QUOTES',
                    output_wrapper    : '// ReRE.js for ES2[' + strCompileType + '], Compatible:ES' + ecmaFeatureVersion + ', ' + aboutReREjs + '\n%output%',
                    js_output_file    : 'ReRE.es2.' + ecmaFeatureVersion + '.' + strCompileType + '.js'
                }
            )
        ).pipe(
            postProcessor.gulp(
                {
                    minIEVersion   : 5,
                    embedPolyfills : true
                }
            )
        ).pipe( gulp.dest( 'dist/' + strCompileType ) );
    }
) );

var strCompileType     = 'develop'; // .release .debug .develop
var ecmaFeatureVersion = 2018;
var clientMinEsVersion = 3;
var isNodejsLibrary    = false;

gulp.task( '__compile_all_compileTypes', gulp.series(
    function( cb ){
        strCompileType = 'develop';cb();
    },
    '__compile',
    function( cb ){
        strCompileType = 'debug';cb();
    },
    '__compile',
    function( cb ){
        strCompileType = 'release';cb();
    },
    '__compile'
) );

gulp.task( '__compile_all_furetre', gulp.series(
    function( cb ){
        ecmaFeatureVersion = 2018;cb();
    },
    '__compile_all_compileTypes',
    function( cb ){
        ecmaFeatureVersion = 2015;cb();
    },
    '__compile_all_compileTypes',
    function( cb ){
        ecmaFeatureVersion = 3;cb();
    },
    '__compile_all_compileTypes'
) );

gulp.task( '__compile_all_target', gulp.series(
    function( cb ){
        clientMinEsVersion = 2;cb();
    },
    '__compile_all_furetre',
    function( cb ){
        clientMinEsVersion = 3;cb();
    },
    '__compile_all_furetre',
    function( cb ){
        clientMinEsVersion = 2015;cb();
    },
    '__compile_all_furetre',
    function( cb ){
        isNodejsLibrary    = true;
        clientMinEsVersion = 3;
        ecmaFeatureVersion = 2018;cb();
    },
    '__compile_all_compileTypes'
) );

gulp.task( 'dist', gulp.series(
    'data',
    '__compile_all_target'
) );
