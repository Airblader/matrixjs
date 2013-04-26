java -jar compiler.jar \
     --js closure-library/closure/goog/base.js \
     --js ../../matrix.js \
     --js_output_file ../../matrix.min.js \
     --process_closure_primitives true \
     --manage_closure_dependencies true \
