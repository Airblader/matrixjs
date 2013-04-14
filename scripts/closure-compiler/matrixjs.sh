java -jar compiler.jar \
     --js closure-library/closure/goog/base.js \
     --js ../../matrix.js \
     --js_output_file ../../../matrix.min.js \
     --compilation_level ADVANCED_OPTIMIZATIONS \
     --generate_exports \
     --process_closure_primitives true \
     --manage_closure_dependencies true \
     --warning_level VERBOSE
