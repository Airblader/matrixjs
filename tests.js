function assertEquals (found, expected, testIdentifier) {
    if( found !== expected ) {
        console.error( '[' + testIdentifier + '] Validation Error: Expected <' + expected + '> but found <' + found + '>' );
    }
}

function assertArray (found, expected, testIdentifier) {
    assertEquals( found.length, expected.length, testIdentifier );
    for( var i = 0; i < Math.max( found.length, expected.length ); i++ ) {
        assertEquals( found[i], expected[i], testIdentifier );
    }
}


(function (identifier) {
    var A = new Matrix( 2 ).set( 1, 1, 2 ).set( 2, 2, 3 );

    assertEquals( A.get( 1, 1 ), 2, identifier );
    assertEquals( A.get( 1, 2 ), 0, identifier );
    assertEquals( A.get( 2, 2 ), 3, identifier );
})( 'Test 1' );

(function (identifier) {
    assertEquals( Matrix.eye( 3 ).equals( Matrix.arrayToMatrix( [1, 0, 0, 0, 1, 0, 0, 0, 1] ) ), true, identifier );
})( 'Test 2' );

(function (identifier) {
    assertEquals( Matrix.eye( 1 ).getLength(), 1, identifier );
    assertEquals( Matrix.eye( 2 ).getLength(), 4, identifier );
    assertEquals( Matrix.eye( 3 ).getLength(), 9, identifier );
    assertEquals( Matrix.eye( 4 ).getLength(), 16, identifier );
})( 'Test 3' );

(function (identifier) {
    assertEquals( Matrix.eye( 3 ).scale( 2 ).equals(
        Matrix.add( Matrix.eye( 3 ), Matrix.eye( 3 ) )
    ), true, identifier );
})( 'Test 4' );

(function (identifier) {
    assertEquals( new Matrix( 3 ).equals(
        Matrix.subtract( Matrix.eye( 3 ), Matrix.eye( 3 ) )
    ), true, identifier );
})( 'Test 5' );

(function (identifier) {
    assertEquals( Matrix.arrayToMatrix( [22, 28, 49, 64], 2, 2 ).equals( Matrix.multiply(
        Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 2, 3 ),
        Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 3, 2 )
    ) ), true, identifier );
})( 'Test 6' );

(function (identifier) {
    assertArray( Matrix.eye( 3 ).getRow( 2 ), [0, 1, 0], identifier );

    assertEquals( Matrix.eye( 3 ).equals( Matrix.zeros( 3 )
        .setRow( 1, [1, 0, 0] )
        .setRow( 2, [0, 1, 0] )
        .setRow( 3, [0, 0, 1] )
    ), true, identifier );
})( 'Test 7' );

(function (identifier) {
    // TODO
    // Test transpose
})( 'Test 8' );

(function (identifier) {
    assertEquals( Matrix.zeros( 3 ).trace(), 0, identifier );
    assertEquals( Matrix.eye( 3 ).trace(), 3, identifier );
    assertEquals( Matrix.arrayToMatrix( [3, 1, 2, 7, -5, 3, 0, 4, 1], 3, 3 ).trace(), -1, identifier );
})( 'Test 9' );

(function (identifier) {
    assertEquals( Matrix.eye( 3 ).det(), 1, identifier );
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 1, 1, 1, 3, 3, 1], 3, 3 ).det(), 2, identifier );
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 ).det(), -12, identifier );

    var isSingular = false;
    try {
        Matrix.zeros( 3 ).det();
    } catch( e ) {
        isSingular = true;
    } finally {
        assertEquals( isSingular, true, identifier );
    }
})( 'Test 10' );

(function (identifier) {
    var M = Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 );

    assertEquals( Matrix.submatrix( M, 1, 3, 1, 3 ).equals( M ), true, identifier );

    assertEquals( Matrix.submatrix( M, 2, 3, 2, 3 ).equals( Matrix.arrayToMatrix(
        [2, 1, 1, 3], 2, 2
    ) ), true, identifier );
})( 'Test 11' );

(function (identifier) {
    var M = Matrix.eye( 3 );
    assertEquals( Matrix.inverse( M ).equals( M ), true, identifier );
    assertEquals( Matrix.inverse( Matrix.scale( M, 2 ) ).equals( Matrix.scale( M, 0.5 ) ), true, identifier );

    assertEquals( Matrix.arrayToMatrix( [4, 7, 2, 6], 2, 2 ).inverse().equals(
        Matrix.arrayToMatrix( [0.6, -0.7, -0.2, 0.4], 2, 2 )
    ), true, identifier );
})( 'Test 12' );

(function (identifier) {
})( 'Test X' );

(function (identifier) {
})( 'Test X' );

(function (identifier) {
})( 'Test X' );

(function (identifier) {
})( 'Test X' );

(function (identifier) {
})( 'Test X' );