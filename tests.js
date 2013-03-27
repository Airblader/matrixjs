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

    document.getElementById( 'result' ).className = (isGreen) ? 'success' : 'error';
}

// ##########
//   TESTS
// ##########

new Test( function (identifier) {
    assertDimension( new Matrix( 3, 3 ), 3, 3 );
}, 'Create Matrix 1' );

new Test( function (identifier) {
    assertDimension( new Matrix( 3, 4 ), 3, 4 );
}, 'Create Matrix 2' );

new Test( function (identifier) {
    assertDimension( new Matrix( 4, 3 ), 4, 3 );
}, 'Create Matrix 3' );

new Test( function (identifier) {
    assertDimension( new Matrix( 3 ), 3, 3 );
}, 'Create Matrix 4' );

new Test( function (identifier) {
    assertDimension( new Matrix( [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ] ), 3, 3 );
}, 'Create Matrix 5' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).get( 2, 3 ), 0 );
}, 'Set/Get Single Element 1' );

new Test( function (identifier) {
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
}, 'Set/Get Single Element 2' );

new Test( function (identifier) {
    var M = new Matrix( 3 );

    assertEquals( M.getLength(), 9 );
    assertEquals( M.isSquare(), true );
}, 'Helper Methods 1' );

new Test( function (identifier) {
    var M = new Matrix( 2, 3 );

    assertEquals( M.getLength(), 6 );
    assertEquals( M.isSquare(), false );
}, 'Helper Methods 2' );

new Test( function (identifier) {
    assertArray( Matrix.zeros( 3 ).getRow( 3 ), [0, 0, 0] );
    assertArray( Matrix.zeros( 3 ).getColumn( 3 ), [0, 0, 0] );
}, 'Set/Get Rows/Columns 1' );

new Test( function (identifier) {
    var M = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    assertArray( M.getRow( 1 ), [1, 2, 3] );
    assertArray( M.getRow( 2 ), [4, 5, 6] );
    assertArray( M.getRow( 3 ), [7, 8, 9] );

    assertArray( M.getColumn( 1 ), [1, 4, 7] );
    assertArray( M.getColumn( 2 ), [2, 5, 8] );
    assertArray( M.getColumn( 3 ), [3, 6, 9] );
}, 'Set/Get Rows/Columns 2' );

new Test( function (identifier) {
    var A = new Matrix( 3 ),
        B = new Matrix( 3 ),
        M = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    A.setRow( 1, [1, 2, 3] );
    A.setRow( 2, [4, 5, 6] );
    A.setRow( 3, [7, 8, 9] );

    B.setColumn( 1, [1, 4, 7] );
    B.setColumn( 2, [2, 5, 8] );
    B.setColumn( 3, [3, 6, 9] );

    assertMatrix( A, M );
    assertMatrix( B, M );
}, 'Set/Get Rows/Columns 3' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).add( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
}, 'Add/Subtract Matrices 1' );

new Test( function (identifier) {
    var A = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ),
        B = Matrix.arrayToMatrix( [9, 8, 7, 6, 5, 4, 3, 2, 1] );

    assertMatrix( A.add( A ), A.scale( 2 ) );
    assertMatrix( A.add( B ), Matrix.ones( 3 ).scale( 10 ) );
}, 'Add/Subtract Matrices 2' );

new Test( function (identifier) {
    var A = Matrix.ones( 3 ).scale( 2 ),
        B = Matrix.ones( 3 );

    assertMatrix( A.subtract( A ), Matrix.zeros( 3 ) );
    assertMatrix( A.subtract( B ), Matrix.ones( 3 ) );

    assertMatrix( Matrix.add( B, B, B ), Matrix.ones( 3 ).scale( 3 ) );
    assertMatrix( Matrix.subtract( Matrix.ones( 3 ).scale( 2 ), Matrix.ones( 3 ), Matrix.ones( 3 ) ),
        Matrix.zeros( 3 ) );
}, 'Add/Subtract Matrices 3' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.eye( 3 ) );
}, 'Multiply 1' );

new Test( function (identifier) {
    var A = Matrix.arrayToMatrix( [1, 2, 1, 2, 3, 2, 3, 4, 3] ),
        B = Matrix.arrayToMatrix( [1, 0, 1, 2, 1, 2, 3, 2, 3] );

    assertMatrix( A.multiply( B ), Matrix.arrayToMatrix( [8, 4, 8, 14, 7, 14, 20, 10, 20] ) );
    assertMatrix( B.multiply( A ), Matrix.arrayToMatrix( [4, 6, 4, 10, 15, 10, 16, 24, 16] ) );
}, 'Multiply 2' );

new Test( function (identifier) {
    var A = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 2, 3 ),
        B = Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 3, 2 );

    assertMatrix( A.multiply( B ), Matrix.arrayToMatrix( [22, 28, 49, 64], 2, 2 ) );
}, 'Multiply 3' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).trace(), 0 );
    assertEquals( Matrix.eye( 5 ).trace(), 5 );
}, 'Trace 1' );

new Test( function (identifier) {
    var M = Matrix.ones( 3 ).set( 1, 1, 2 ).set( 2, 2, 3 ).set( 3, 3, 5 );
    assertEquals( M.trace(), 10 );
}, 'Trace 2' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).transpose(), Matrix.zeros( 3 ) );
}, 'Transpose 1' );

new Test( function (identifier) {
    assertMatrix( Matrix.eye( 3 ).transpose(), Matrix.eye( 3 ) );
}, 'Transpose 2' );

new Test( function (identifier) {
    assertMatrix( Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ).transpose(),
        Matrix.arrayToMatrix( [1, 4, 7, 2, 5, 8, 3, 6, 9] ) );
}, 'Transpose 3' );

new Test( function (identifier) {
    assertMatrix( Matrix.arrayToMatrix( [1, 2, 3, 4, 5, 6], 2, 3 ).transpose(),
        Matrix.arrayToMatrix( [1, 4, 2, 5, 3, 6], 3, 2 ) );
}, 'Transpose 4' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).det(), 1 );
}, 'Determinant 1' );

new Test( function (identifier) {
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 1, 1, 1, 3, 3, 1], 3, 3 ).det(), 2 );
}, 'Determinant 2' );

new Test( function (identifier) {
    assertEquals( Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 ).det(), -12 );
}, 'Determinant 3' );

new Test( function (identifier) {
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
}, 'Determinant 4' );

new Test( function (identifier) {
    assertMatrix( Matrix.eye( 3 ).inverse(), Matrix.eye( 3 ) );
}, 'Inverse 1' );

new Test( function (identifier) {
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).inverse(), Matrix.eye( 3 ).scale( 0.5 ) );
}, 'Inverse 2' );

new Test( function (identifier) {
    assertMatrix( Matrix.arrayToMatrix( [4, 7, 2, 6], 2, 2 ).inverse(),
        Matrix.arrayToMatrix( [0.6, -0.7, -0.2, 0.4], 2, 2 ) );
}, 'Inverse 3' );

new Test( function (identifier) {
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
}, 'Inverse 4' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).submatrix( 2, 3, 2, 3 ), Matrix.zeros( 2 ) );
}, 'Submatrix 1' );

new Test( function (identifier) {
    var M = Matrix.arrayToMatrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 );

    assertMatrix( Matrix.submatrix( M, 1, 3, 1, 3 ), M );
    assertMatrix( Matrix.submatrix( M, 2, 3, 2, 3 ), Matrix.arrayToMatrix( [2, 1, 1, 3], 2, 2 ) );
}, 'Submatrix 2' );

new Test( function (identifier) {
    var M = new Matrix( [
        [1, 4, 6],
        [7, 2, 5],
        [9, 8, 3]
    ] );

    assertArray( M.diag(), [1, 2, 3] );

    assertArray( M.diag( 1 ), [4, 5] );
    assertArray( M.diag( 2 ), [6] );
    assertArray( M.diag( -1 ), [7, 8] );
    assertArray( M.diag( -2 ), [9] );
}, 'Diag 1' );

new Test( function (identifier) {
    assertArray( Matrix.zeros( 3 ).diag(), [0, 0, 0] );
}, 'Diag 2' );

new Test( function (identifier) {
    assertMatrix( Matrix.diag( [1, 1, 1] ), Matrix.eye( 3 ) );
}, 'Diag 3' );

new Test( function (identifier) {
    assertMatrix( Matrix.diag( [0, 0, 0] ), Matrix.zeros( 3 ) );
}, 'Diag 4' );

new Test( function (identifier) {
    assertMatrix( Matrix.diag( [1, 2, 3] ), new Matrix( [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
    ] ) );
}, 'Diag 5' );

new Test( function (identifier) {
    assertMatrix( Matrix.zeros( 3 ).roundTo( 0 ), Matrix.zeros( 3 ) );
}, 'RoundTo 1' );

new Test( function (identifier) {
    var M = new Matrix( [
        [1.1, 0, 0],
        [0, 2.1, 0],
        [0, 0, 3.1]
    ] ).scale( 0.5 );

    assertArray( M.roundTo( 0 ).diag(), [1, 1, 2] );
    assertArray( M.roundTo( 1 ).diag(), [0.6, 1.1, 1.6] );
}, 'RoundTo 2' );

new Test( function (identifier) {
    var M = Matrix.zeros( 1, 3 );

    assertEquals( M.dot( M ), 0 );
}, 'Dot Product 1' );

new Test( function (identifier) {
    var A = new Matrix( [
            [1, 2, 3]
        ] ),
        B = new Matrix( [
            [3, 2, 1]
        ] );

    assertEquals( A.dot( A ), 14 );
    assertEquals( B.dot( B ), 14 );

    assertEquals( A.dot( B ), 10 );
    assertEquals( B.dot( A ), 10 );
}, 'Dot Product 2' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).contains( 1 ), true );
}, 'Contains 1' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).contains( 0 ), true );
}, 'Contains 2' );

new Test( function (identifier) {
    assertEquals( Matrix.eye( 3 ).contains( 2 ), false );
}, 'Contains 3' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).contains( 0 ), true );
}, 'Contains 4' );

new Test( function (identifier) {
    assertEquals( Matrix.ones( 3 ).contains( 0 ), false );
}, 'Contains 5' );

new Test( function (identifier) {
    assertEquals( new Matrix( [
        [0, 0, 1]
    ] ).contains( 1 ), true );
}, 'Contains 6' );

new Test( function (identifier) {
    assertEquals( Matrix.zeros( 3 ).set( 3, 3, 1 ).contains( 1 ), true );
}, 'Contains 7' );

new Test( function (identifier) {
    var A = Matrix.eye( 3 ),
        B = Matrix.zeros( 3 );

    assertEquals( A.equals( A ), true );
    assertEquals( A.equals( B ), false );
    assertEquals( B.equals( B ), true );
}, 'Equals 1' );

new Test( function (identifier) {
    var A = Matrix.ones( 2, 3 ),
        B = Matrix.ones( 3, 2 ),
        C = Matrix.zeros( 2, 3 );

    assertEquals( A.equals( B ), false );
    assertEquals( A.equals( C ), false );
}, 'Equals 2' );

new Test( function (identifier) {
    var M = Matrix.zeros( 3 );

    assertMatrix( M.abs(), M );
}, 'Abs 1' );

new Test( function (identifier) {
    var A = Matrix.eye( 3 ),
        B = Matrix.ones( 3 ),
        C = B.subtract( A.scale( 2 ) );

    assertMatrix( A.abs(), A );
    assertMatrix( B.abs(), B );
    assertMatrix( C.abs(), A );
}, 'Abs 2' );

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
    var M = Matrix.eye( 3 );

    assertEquals( M.getDimensions().rows, 3 );
    assertEquals( M.getDimensions().columns, 3 );
    assertEquals( M.dim().rows, 3 );
    assertEquals( M.dim().columns, 3 );
}, 'Get Dimensions 1' );

new Test( function (identifier) {
    var M = Matrix.ones( 2, 3 );

    assertEquals( M.dim( 1 ), 2 );
    assertEquals( M.dim( 2 ), 3 );
    assertEquals( M.dim( 'rows' ), 2 );
    assertEquals( M.dim( 'columns' ), 3 );
}, 'Get Dimensions 2' );

new Test( function (identifier) {
    var M = Matrix.zeros( 3, 2 );

    assertEquals( M.dim( 1 ), 3 );
    assertEquals( M.dim( 2 ), 2 );
}, 'Get Dimensions 3' );

new Test( function (identifier) {
}, '' );

// ##########

Test.runAll();