function fail (msg) {
    throw new Error( msg );
}

function assertEquals (found, expected) {
    if( found !== expected ) {
        throw new Error( 'Expected &lt;' + expected + '&gt; but found &lt;' + found + '&gt;' );
    }
}

function assertArray (found, expected) {
    assertEquals( found.length, expected.length );
    for( var i = 0; i < Math.max( found.length, expected.length ); i++ ) {
        assertEquals( found[i], expected[i] );
    }
}

function assertMatrix (found, expected) {
    try {
        assertEquals( found.equals( expected ), true );
    } catch( e ) {
        console.error( 'assertMatrix Error:' );
        console.log( '-------FOUND-------' );
        console.log( found.toString() );
        console.log( '-----EXPECTED------' );
        console.log( expected.toString() );

        throw e;
    }
}

function assertDimension (M, rows, columns) {
    assertEquals( M.dim().rows, rows );
    assertEquals( M.dim().columns, columns );
}

// ##########

function Test (func, name, ignore) {
    this.func = func;
    this.name = name;
    this.ignore = ignore || false;

    Test.tests.push( this );
}

Test.tests = [];

Test.prototype.run = function (identifier) {
    if( this.ignore ) {
        return true;
    }

    var success = true;
    try {
        this.func( identifier );
    } catch( e ) {
        success = false;
        document.getElementById( 'logger' ).innerHTML +=
            '<div class="error">Test ' + identifier + ' [' + this.name + '] failed: ' + e + '</div>';
    } finally {
        if( success ) {
            document.getElementById( 'logger' ).innerHTML +=
                '<div class="success">Test ' + identifier + ' successful.</div>';
        }

        return success;
    }
}

Test.runAll = function () {
    document.getElementById( 'logger' ).innerHTML = '';
    var isGreen = true,
        start = new Date().getTime();

    for( var i = 0; i < Test.tests.length; i++ ) {
        var success = Test.tests[i].run( i + 1 );

        if( !success ) {
            isGreen = false;
        }
    }

    var time = ( new Date().getTime() - start ) / 1000;
    document.getElementById( 'time' ).innerHTML = time;

    if( !isGreen ) {
        alert( 'There are failed tests.' );
    }
}

// ##########
//   TESTS
// ##########

new Test( function (identifier) {
    assertDimension( new Matrix( 3, 3 ), 3, 3 );
    assertDimension( new Matrix( 3, 4 ), 3, 4 );
    assertDimension( new Matrix( 4, 3 ), 4, 3 );
    assertDimension( new Matrix( 3 ), 3, 3 );

    assertDimension( new Matrix( [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ] ), 3, 3 );
}, 'Create Matrix' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).get( 2, 3 ), 0 );

    var M = new Matrix( 3 );
    M.set( 1, 1, 1 );
    M.set( 2, 2, 2 );
    M.set( 3, 3, 3 );
    M.set( 2, 3, 7 );

    assertMatrix( M, Matrix.arrayToMatrix( [1, 0, 0, 0, 2, 7, 0, 0, 3] ) );

    assertEquals( M.get( 1, 1 ), 1 );
    assertEquals( M.get( 2, 2 ), 2 );
    assertEquals( M.get( 3, 3 ), 3 );
    assertEquals( M.get( 2, 3 ), 7 );

    assertEquals( M.get( 1 ), 1 );
    assertEquals( M.get( 6 ), 7 );
}, 'Set/Get Single Element' );

new Test( function (identifier) {
    var M = new Matrix( 3 );

    assertEquals( M.getLength(), 9 );
    assertEquals( M.isSquare(), true );

    var N = new Matrix( 2, 3 );

    assertEquals( N.getLength(), 6 );
    assertEquals( N.isSquare(), false );
}, 'Helper Methods' );

new Test( function (identifier) {
    assertArray( Matrix.zeros( 3 ).getRow( 3 ), [0, 0, 0] );
    assertArray( Matrix.zeros( 3 ).getColumn( 3 ), [0, 0, 0] );

    var M = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    assertArray( M.getRow( 1 ), [1, 2, 3] );
    assertArray( M.getRow( 2 ), [4, 5, 6] );
    assertArray( M.getRow( 3 ), [7, 8, 9] );

    assertArray( M.getColumn( 1 ), [1, 4, 7] );
    assertArray( M.getColumn( 2 ), [2, 5, 8] );
    assertArray( M.getColumn( 3 ), [3, 6, 9] );

    var A = new Matrix( 3 );

    A.setRow( 1, [1, 2, 3] );
    A.setRow( 2, [4, 5, 6] );
    A.setRow( 3, [7, 8, 9] );

    var B = new Matrix( 3 );

    B.setColumn( 1, [1, 4, 7] );
    B.setColumn( 2, [2, 5, 8] );
    B.setColumn( 3, [3, 6, 9] );

    assertMatrix( A, M );
    assertMatrix( B, M );
}, 'Set/Get Rows/Columns' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).add( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );

    var A = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ),
        B = Matrix.arrayToMatrix( [9, 8, 7, 6, 5, 4, 3, 2, 1] );

    assertMatrix( A.add( A ), A.scale( 2 ) );
    assertMatrix( A.add( B ), Matrix.ones( 3 ).scale( 10 ) );

    var C = Matrix.ones( 3 ).scale( 2 ),
        D = Matrix.ones( 3 );

    assertMatrix( C.subtract( C ), Matrix.zeros( 3 ) );
    assertMatrix( C.subtract( D ), Matrix.ones( 3 ) );

    assertMatrix( Matrix.add( D, D, D ), Matrix.ones( 3 ).scale( 3 ) );
    assertMatrix( Matrix.subtract( Matrix.ones( 3 ).scale( 2 ), Matrix.ones( 3 ), Matrix.ones( 3 ) ),
        Matrix.zeros( 3 ) );
}, 'Add/Subtract Matrices' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.eye( 3 ) );

    var A = Matrix.arrayToMatrix( [1, 2, 1, 2, 3, 2, 3, 4, 3] ),
        B = Matrix.arrayToMatrix( [1, 0, 1, 2, 1, 2, 3, 2, 3] );

    assertMatrix( A.multiply( B ), Matrix.arrayToMatrix( [8, 4, 8, 14, 7, 14, 20, 10, 20] ) );
    assertMatrix( B.multiply( A ), Matrix.arrayToMatrix( [4, 6, 4, 10, 15, 10, 16, 24, 16] ) );

    var C = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 2, 3 ),
        D = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 3, 2 );

    assertMatrix( C.multiply( D ), Matrix.arrayToMatrix( [22, 28, 49, 64], 2, 2 ) );
}, 'Multiply' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).trace(), 0 );
    assertEquals( Matrix.eye( 5 ).trace(), 5 );

    var M = Matrix.ones( 3 ).set( 1, 1, 2 ).set( 2, 2, 3 ).set( 3, 3, 5 );
    assertEquals( M.trace(), 10 );
}, 'Trace' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).transpose(), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).transpose(), Matrix.eye( 3 ) );

    assertMatrix( Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ).transpose(),
        Matrix.arrayToMatrix( [1, 4, 7, 2, 5, 8, 3, 6, 9] ) );

    assertMatrix( Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 2, 3 ).transpose(),
        Matrix.arrayToMatrix( [1, 4, 2, 5, 3, 6], 3, 2 ) );
}, 'Transpose' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).det(), 1 );
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 1, 1, 1, 3, 3, 1], 3, 3 ).det(), 2 );
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 ).det(), -12 );

    var isSingular = false;
    try {
        Matrix.zeros( 3 ).det();
    } catch( e ) {
        isSingular = true;
    } finally {
        if( !isSingular ) {
            fail( 'Expected error for singular matrix.' );
        }
    }
}, 'Determinant' );

new Test( function (identifier) {
    assertMatrix( Matrix.eye( 3 ).inverse(), Matrix.eye( 3 ) );
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).inverse(), Matrix.eye( 3 ).scale( 0.5 ) );

    assertMatrix( Matrix.arrayToMatrix( [4, 7, 2, 6], 2, 2 ).inverse(),
        Matrix.arrayToMatrix( [0.6, -0.7, -0.2, 0.4], 2, 2 ) );

    var isSingular = false;
    try {
        Matrix.zeros( 3 ).inverse();
    } catch( e ) {
        isSingular = true;
    } finally {
        if( !isSingular ) {
            fail( 'Expected error for singular matrix.' );
        }
    }
}, 'Inverse' );

new Test( function (identifier) {
    var M = Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 );

    assertMatrix( Matrix.submatrix( M, 1, 3, 1, 3 ), M );
    assertMatrix( Matrix.submatrix( M, 2, 3, 2, 3 ), Matrix.arrayToMatrix( [2, 1, 1, 3], 2, 2 ) );

    assertMatrix( Matrix.zeros( 3 ).submatrix( 2, 3, 2, 3 ), Matrix.zeros( 2 ) );
}, 'Submatrix' );

new Test( function (identifier) {
    var M = new Matrix( [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
    ] );

    assertArray( M.diag(), [1, 2, 3] );
    assertArray( Matrix.zeros( 3 ).diag(), [0, 0, 0] );

    assertMatrix( Matrix.diag( [1, 1, 1] ), Matrix.eye( 3 ) );
    assertMatrix( Matrix.diag( [1, 2, 3] ), M );
    assertMatrix( Matrix.diag( [0, 0, 0] ), Matrix.zeros( 3 ) );
}, 'Diag' );

new Test( function (identifier) {
    var M = new Matrix( [
        [1.1, 0, 0],
        [0, 2.1, 0],
        [0, 0, 3.1]
    ] ).scale( 0.5 );

    assertArray( M.roundTo( 0 ).diag(), [1, 1, 2] );
    assertArray( M.roundTo( 1 ).diag(), [0.6, 1.1, 1.6] );

    assertMatrix( Matrix.zeros( 3 ).roundTo( 0 ), Matrix.zeros( 3 ) );
}, 'RoundTo' );

new Test( function (identifier) {
    var A = new Matrix( [
            [1, 2, 3]
        ] ),
        B = new Matrix( [
            [3, 2, 1]
        ] ),
        C = Matrix.zeros( 1, 3 );

    assertEquals( A.dot( B ), 10 );
    assertEquals( B.dot( A ), 10 );

    assertEquals( A.dot( A ), 14 );
    assertEquals( B.dot( B ), 14 );

    assertEquals( C.dot( C ), 0 );
}, 'Dot Product' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).contains( 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 0 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 2 ), false );
    assertEquals( Matrix.zeros( 3 ).contains( 0 ), true );

    assertEquals( new Matrix( [
        [0, 0, 1]
    ] ).contains( 1 ), true );

    assertEquals( Matrix.zeros( 3 ).set( 3, 3, 1 ).contains( 1 ), true );
}, 'Contains' );

new Test( function (identifier) {
    var A = Matrix.eye( 3 ),
        B = Matrix.zeros( 3 ),
        C = Matrix.ones( 2, 3 ),
        D = Matrix.ones( 3, 2 ),
        E = Matrix.zeros( 2, 3 );

    assertEquals( A.equals( A ), true );
    assertEquals( A.equals( B ), false );
    assertEquals( B.equals( B ), true );
    assertEquals( C.equals( D ), false );
    assertEquals( C.equals( E ), false );
}, 'Equals' );

new Test( function (identifier) {
    var A = Matrix.eye( 3 ),
        B = Matrix.ones( 3 ),
        C = B.subtract( A.scale( 2 ) ),
        D = Matrix.zeros( 3 );

    assertMatrix( A.abs(), A );
    assertMatrix( B.abs(), B );
    assertMatrix( C.abs(), A );
    assertMatrix( D.abs(), D );
}, 'Abs' );

new Test( function (identifier) {
    var A = new Matrix( [
            [1, 2, 3]
        ] ),
        B = new Matrix( [
            [-7, 8, 9]
        ] ),
        C = new Matrix( [
            [-6, -30, 22]
        ] ),
        D = Matrix.zeros( 1, 3 );

    assertMatrix( A.cross( B ), C.transpose() );
    assertMatrix( D.cross( D ), D.transpose() );

    assertMatrix( A.cross( B ), B.cross( A ).scale( -1 ) );
    assertMatrix( A.cross( A ), Matrix.zeros( 3, 1 ) );

    var V = new Matrix( [
        [1, 2, 5]
    ] );

    assertEquals( Math.round( V.multiply( A.cross( B ) ) ), Math.round( new Matrix( 3 )
        .setColumn( 1, V.__getElements() )
        .setColumn( 2, A.__getElements() )
        .setColumn( 3, B.__getElements() )
        .det()
    ) );
}, 'Cross Product' );

new Test( function (identifier) {
}, '' );

// ##########

Test.runAll();