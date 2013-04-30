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
        console.log( found.stringify() );
        console.log( '-----EXPECTED------' );
        console.log( expected.stringify() );

        throw e;
    }
}

function assertDimension (M, rows, columns) {
    assertEquals( M.dim( 1 ), rows );
    assertEquals( M.dim( 2 ), columns );
}

function assertException (func) {
    var hasThrown = false;

    try {
        func();
    } catch( e ) {
        hasThrown = true;
    } finally {
        if( !hasThrown ) {
            throw new Error( 'Expected exception, but none was thrown.' );
        }
    }
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
        this.func();
    } catch( e ) {
        success = false;

        document.getElementById( 'logger' ).innerHTML +=
            '<div class="error">Test ' + identifier + ' [' + this.name + '] failed: ' + e + '</div>';
    } finally {
        if( success ) {
            document.getElementById( 'logger' ).innerHTML +=
                '<div class="success">Test ' + identifier + ' [' + this.name + '] successful.</div>';
        }
    }

    return success;
};

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
    document.getElementById( 'time' ).innerHTML = time.toString();

    document.getElementById( 'result' ).className = (isGreen) ? 'success' : 'error';
};

// ##########
//   TESTS
// ##########

new Test( function () {
    assertDimension( new Matrix( 3 ), 3, 3 );
    assertDimension( new Matrix( 3, 3 ), 3, 3 );
    assertDimension( new Matrix( 3, 4 ), 3, 4 );
    assertDimension( new Matrix( 4, 3 ), 4, 3 );
}, 'Matrix: Create 1' );

new Test( function () {
    assertDimension( new Matrix( [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ] ), 3, 3 );
}, 'Matrix: Create 2' );

new Test( function () {
    assertMatrix( new Matrix( [1, 0, 0, 0, 1, 0, 0, 0, 1] ), Matrix.eye( 3 ) );
}, 'Matrix: Create 3' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Matrix: Create 4' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Matrix: Create 5' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], null, 3 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Matrix: Create 6' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).get( 2, 3 ), 0 );
    assertEquals( Matrix.eye( 3 ).get( 2, 2 ), 1 );
}, 'Matrix: Get' );

new Test( function () {
    var M = new Matrix( 3 );
    M.set( 1, 1, 1 );
    M.set( 2, 2, 2 );
    M.set( 3, 3, 3 );
    M.set( 2, 3, 7 );

    assertMatrix( M, new Matrix( [1, 0, 0, 0, 2, 7, 0, 0, 3] ) );

    assertEquals( M.get( 1, 1 ), 1 );
    assertEquals( M.get( 2, 2 ), 2 );
    assertEquals( M.get( 3, 3 ), 3 );
    assertEquals( M.get( 2, 3 ), 7 );
}, 'Matrix: Set' );

new Test( function () {
    var M = new Matrix( 3 );

    assertEquals( M.size(), 9 );
    assertEquals( M.isSquare(), true );
}, 'Matrix: Size / isSquare 1' );

new Test( function () {
    var M = new Matrix( 2, 3 );

    assertEquals( M.size(), 6 );
    assertEquals( M.isSquare(), false );
}, 'Matrix: Size / isSquare 2' );

new Test( function () {
    assertArray( Matrix.zeros( 3 ).getRow( 3 ), [0, 0, 0] );
    assertArray( Matrix.zeros( 3 ).getColumn( 3 ), [0, 0, 0] );
}, 'Matrix: Get Row / Get Column 1' );

new Test( function () {
    var M = new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    assertArray( M.getRow( 1 ), [1, 2, 3] );
    assertArray( M.getRow( 2 ), [4, 5, 6] );
    assertArray( M.getRow( 3 ), [7, 8, 9] );

    assertArray( M.getColumn( 1 ), [1, 4, 7] );
    assertArray( M.getColumn( 2 ), [2, 5, 8] );
    assertArray( M.getColumn( 3 ), [3, 6, 9] );
}, 'Matrix: Get Row / Get Column 2' );

new Test( function () {
    var A = new Matrix( 3 ),
        B = new Matrix( 3 ),
        M = new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    A.setRow( 1, [1, 2, 3] );
    A.setRow( 2, [4, 5, 6] );
    A.setRow( 3, [7, 8, 9] );

    B.setColumn( 1, [1, 4, 7] );
    B.setColumn( 2, [2, 5, 8] );
    B.setColumn( 3, [3, 6, 9] );

    assertMatrix( A, M );
    assertMatrix( B, M );
}, 'Matrix: Set Row / Set Column 1' );

new Test( function () {
    var A = new Matrix( 3 );

    A.setRow( 1, new Matrix( [1, 0, 0], 1, 3 ) );
    A.setRow( 2, new Matrix( [0, 1, 0], 1, 3 ) );
    A.setRow( 3, new Matrix( [0, 0, 1], 1, 3 ) );

    assertMatrix( A, Matrix.eye( 3 ) );

    var B = new Matrix( 3 );

    B.setColumn( 1, new Matrix( [1, 0, 0], 3, 1 ) );
    B.setColumn( 2, new Matrix( [0, 1, 0], 3, 1 ) );
    B.setColumn( 3, new Matrix( [0, 0, 1], 3, 1 ) );

    assertMatrix( B, Matrix.eye( 3 ) );
}, 'Matrix: Set Row / Set Column 2' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).add( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );

    var A = new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ),
        B = new Matrix( [9, 8, 7, 6, 5, 4, 3, 2, 1] );

    assertMatrix( A.add( A ), A.scale( 2 ) );
    assertMatrix( A.add( B ), Matrix.ones( 3 ).scale( 10 ) );

    assertMatrix( B.add( B, B ), B.scale( 3 ) );
}, 'Matrix: Add' );

new Test( function () {
    var A = Matrix.ones( 3 ).scale( 2 ),
        B = Matrix.ones( 3 );

    assertMatrix( A.subtract( A ), Matrix.zeros( 3 ) );
    assertMatrix( A.subtract( B ), Matrix.ones( 3 ) );

    assertMatrix( B.scale( 2 ).subtract( B, B ), Matrix.zeros( 3 ) );
}, 'Matrix: Subtract' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.eye( 3 ) );
}, 'Matrix: Multiply 1' );

new Test( function () {
    var A = new Matrix( [1, 2, 1, 2, 3, 2, 3, 4, 3] ),
        B = new Matrix( [1, 0, 1, 2, 1, 2, 3, 2, 3] );

    assertMatrix( A.multiply( B ), new Matrix( [8, 4, 8, 14, 7, 14, 20, 10, 20] ) );
    assertMatrix( B.multiply( A ), new Matrix( [4, 6, 4, 10, 15, 10, 16, 24, 16] ) );
}, 'Matrix: Multiply 2' );

new Test( function () {
    var A = new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ),
        B = new Matrix( [1, 2, 3, 4, 5, 6], 3, 2 );

    assertMatrix( A.multiply( B ), new Matrix( [22, 28, 49, 64], 2, 2 ) );
}, 'Matrix: Multiply 3' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).trace(), 0 );
    assertEquals( Matrix.eye( 5 ).trace(), 5 );

    var M = Matrix.ones( 3 ).set( 1, 1, 2 ).set( 2, 2, 3 ).set( 3, 3, 5 );
    assertEquals( M.trace(), 10 );
}, 'Matrix: Trace' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).transpose(), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).transpose(), Matrix.eye( 3 ) );
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ).transpose(),
        new Matrix( [1, 4, 7, 2, 5, 8, 3, 6, 9] ) );
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ).transpose(),
        new Matrix( [1, 4, 2, 5, 3, 6], 3, 2 ) );
}, 'Matrix: Transpose' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).det(), 0 );
    assertEquals( Matrix.eye( 3 ).det(), 1 );

    assertEquals( new Matrix( [1, 2, 3, 1, 1, 1, 3, 3, 1], 3, 3 ).det(), 2 );
    assertEquals( new Matrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 ).det(), -12 );
}, 'Matrix: Determinant' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).inverse(), Matrix.eye( 3 ) );
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).inverse(), Matrix.eye( 3 ).scale( 0.5 ) );
    assertMatrix( new Matrix( [4, 7, 2, 6], 2, 2 ).inverse(),
        new Matrix( [0.6, -0.7, -0.2, 0.4], 2, 2 ) );

    assertException( function () {
        Matrix.zeros( 3 ).inverse();
    } );
}, 'Matrix: Inverse' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).submatrix( 2, 3, 2, 3 ), Matrix.zeros( 2 ) );

    var M = new Matrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 );

    assertMatrix( M.submatrix( 1, 3, 1, 3 ), M );
    assertMatrix( M.submatrix( 2, 3, 2, 3 ), new Matrix( [2, 1, 1, 3], 2, 2 ) );
}, 'Matrix: Submatrix' );

new Test( function () {
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
}, 'Matrix: Diag 1' );

new Test( function () {
    assertArray( Matrix.zeros( 3 ).diag(), [0, 0, 0] );
    assertMatrix( Matrix.diag( [1, 1, 1] ), Matrix.eye( 3 ) );
    assertMatrix( Matrix.diag( [0, 0, 0] ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.diag( [1, 2], 1 ), new Matrix( [
        [0, 1, 0],
        [0, 0, 2],
        [0, 0, 0]
    ] ) );
    assertMatrix( Matrix.diag( [1, 2], -1 ), new Matrix( [
        [0, 0, 0],
        [1, 0, 0],
        [0, 2, 0]
    ] ) );
    assertMatrix( Matrix.diag( [1, 2, 3] ), new Matrix( [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
    ] ) );
    assertMatrix( Matrix.diag( Matrix.ones( 1, 3 ) ), Matrix.eye( 3 ) );
}, 'Matrix: Diag 2' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).roundTo( 0 ), Matrix.zeros( 3 ) );

    var M = new Matrix( [
        [1.1, 0, 0],
        [0, 2.1, 0],
        [0, 0, 3.1]
    ] ).scale( 0.5 );

    assertArray( M.round().diag(), [1, 1, 2] );
    assertArray( M.roundTo( 0 ).diag(), [1, 1, 2] );
    assertArray( M.roundTo( 1 ).diag(), [0.6, 1.1, 1.6] );
}, 'Matrix: Round / RoundTo' );

new Test( function () {
    var M = Matrix.zeros( 3, 1 );
    assertEquals( M.dot( M ), 0 );

    var A = new Matrix( [
            [1, 2, 3]
        ] ).transpose(),
        B = new Matrix( [
            [3, 2, 1]
        ] ).transpose();

    assertEquals( A.dot( A ), 14 );
    assertEquals( B.dot( B ), 14 );

    assertEquals( A.dot( B ), 10 );
    assertEquals( B.dot( A ), 10 );
}, 'Matrix: Dot Product', true );

new Test( function () {
    assertEquals( Matrix.eye( 3 ).contains( 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 0 ), true );
    assertEquals( Matrix.zeros( 3 ).contains( 0 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 2 ), false );
    assertEquals( Matrix.ones( 3 ).contains( 0 ), false );

    assertEquals( new Matrix( [
        [0, 0, 1]
    ] ).contains( 1 ), true );

    assertEquals( Matrix.zeros( 3 ).set( 3, 3, 1 ).contains( 1 ), true );
    assertEquals( Matrix.zeros( 3 ).contains( 0.5, 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 0.5, 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 2, 0.5 ), false );
}, 'Matrix: Contains' );

new Test( function () {
    var A = Matrix.eye( 3 ),
        B = Matrix.zeros( 3 );

    assertEquals( A.equals( A ), true );
    assertEquals( A.equals( B ), false );
    assertEquals( B.equals( B ), true );
}, 'Matrix: Equals 1' );

new Test( function () {
    var A = Matrix.ones( 2, 3 ),
        B = Matrix.ones( 3, 2 ),
        C = Matrix.zeros( 2, 3 );

    assertEquals( A.equals( B ), false );
    assertEquals( A.equals( C ), false );
}, 'Matrix: Equals 2' );

new Test( function () {
    var M = Matrix.zeros( 3 );
    assertMatrix( M.abs(), M );

    var A = Matrix.eye( 3 ),
        B = Matrix.ones( 3 ),
        C = B.subtract( A.scale( 2 ) );

    assertMatrix( A.abs(), A );
    assertMatrix( B.abs(), B );
    assertMatrix( C.abs(), B );
}, 'Matrix: Abs' );

new Test( function () {
    var A = new Matrix( [
            [1, 2, 3]
        ] ).transpose(),
        B = new Matrix( [
            [-7, 8, 9]
        ] ).transpose(),
        C = new Matrix( [
            [-6, -30, 22]
        ] ).transpose(),
        D = Matrix.zeros( 3, 1 );

    assertMatrix( A.cross( B ), C );
    assertMatrix( D.cross( D ), D );

    assertMatrix( A.cross( B ), B.cross( A ).scale( -1 ) );
    assertMatrix( A.cross( A ), Matrix.zeros( 3, 1 ) );

    var V = new Matrix( [
        [1, 2, 5]
    ] );

    assertEquals( Math.round( V.multiply( A.cross( B ) ).get( 1, 1 ) ), Math.round( new Matrix( 3 )
        .setColumn( 1, V.getRow( 1 ) )
        .setColumn( 2, A.getColumn( 1 ) )
        .setColumn( 3, B.getColumn( 1 ) )
        .det()
    ) );
}, 'Matrix: Cross Product', true );

new Test( function () {
    var M = Matrix.eye( 3 );

    assertEquals( M.dim( 1 ), 3 );
    assertEquals( M.dim( 2 ), 3 );
}, 'Matrix: Dim 1' );

new Test( function () {
    var M = Matrix.ones( 2, 3 );

    assertEquals( M.dim( 1 ), 2 );
    assertEquals( M.dim( 2 ), 3 );
    assertEquals( M.dim( 'rows' ), 2 );
    assertEquals( M.dim( 'columns' ), 3 );
}, 'Matrix: Dim 2' );

new Test( function () {
    var M = Matrix.zeros( 3, 2 );

    assertEquals( M.dim( 1 ), 3 );
    assertEquals( M.dim( 2 ), 2 );
}, 'Matrix: Dim 3' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4] ).addColumn( [5, 6] ), new Matrix( [1, 2, 5, 3, 4, 6], 2, 3 ) );
    assertMatrix( Matrix.zeros( 3 ).addColumn( Matrix.zeros( 3 ).getColumn( 1 ) ), Matrix.zeros( 3, 4 ) );
    assertMatrix( Matrix.eye( 2 ).addColumn( Matrix.ones( 2, 1 ) ), new Matrix( [1, 0, 1, 0, 1, 1], 2, 3 ) );
}, 'Matrix: Add Column' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4] ).addRow( [5, 6] ), new Matrix( [1, 2, 3, 4, 5, 6], 3, 2 ) );
    assertMatrix( Matrix.zeros( 3 ).addRow( Matrix.zeros( 3 ).getRow( 1 ) ), Matrix.zeros( 4, 3 ) );
    assertMatrix( Matrix.eye( 2 ).addRow( Matrix.ones( 1, 2 ) ), new Matrix( [1, 0, 0, 1, 1, 1], 3, 2 ) );
}, 'Matrix: Add Row' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).fun( function (value) {
        return value + 1;
    } ), Matrix.ones( 3 ) );

    assertMatrix( Matrix.zeros( 3 ).fun( function (value) {
        return value + 1;
    }, MatrixUtils.filters.diag ), Matrix.eye( 3 ) );

    assertMatrix( Matrix.eye( 3 ).fun( function (value, row, column) {
        return value + row * column;
    } ), new Matrix( [2, 2, 3, 2, 5, 6, 3, 6, 10] ) );

    assertMatrix( Matrix.eye( 3 ).scale( 2 ).fun( MatrixUtils.applicators.square ),
        Matrix.eye( 3 ).scale( 4 ) );
}, 'Matrix: Apply' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).spfun( function (value) {
        return value + 1;
    } ), Matrix.eye( 3 ).scale( 2 ) );
}, 'Matrix: Apply Non-Zero' );

new Test( function () {
    var e = Math.E;
    assertMatrix( Matrix.eye( 3 ).pw_exp(), new Matrix( [e, 1, 1, 1, e, 1, 1, 1, e] ) );

    assertMatrix( Matrix.eye( 3 ).scale( 2 ).pw_pow( 3 ), Matrix.eye( 3 ).scale( 8 ) );
}, 'Matrix: Exp / Pow' );

new Test( function () {
    assertMatrix( [0, 0, 0, 0].toMatrix(), Matrix.zeros( 2 ) );
    assertMatrix( [1, 2, 3, 4, 5, 6].toMatrix( 2, 3 ), new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ) );
}, 'Array: toMatrix' );

new Test( function () {
    assertMatrix( [1, 2, 3, 4, 5, 6].toVector(), new Matrix( [1, 2, 3, 4, 5, 6], 6, 1 ) );
    assertMatrix( [1, 2, 3, 4, 5, 6].toVector( true ), new Matrix( [1, 2, 3, 4, 5, 6], 1, 6 ) );
}, 'Array: toVector' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).norm( 'p', 2 ), 0 );
    assertEquals( Matrix.eye( 4 ).norm( 'p', 2 ), 2 );
    assertEquals( Matrix.ones( 3 ).norm( 'p', 2 ), 3 );

    assertEquals( Matrix.diag( [1, 2, 1, 2, 1, 2] ).norm( 'p', 3 ), 3 );
}, 'Matrix: Norm 1' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).norm( 'max' ), 0 );
    assertEquals( Matrix.eye( 3 ).norm( 'max' ), 1 );
    assertEquals( Matrix.zeros( 5 ).set( 3, 4, 10 ).norm( 'max' ), 10 );
    assertEquals( Matrix.zeros( 5 ).set( 3, 4, -10 ).norm( 'max' ), 10 );
}, 'Matrix: Norm 2' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).norm( 'rows' ), 0 );
    assertEquals( Matrix.eye( 3 ).norm( 'rows' ), 1 );
    assertEquals( Matrix.diag( [1, 3, 2] ).norm( 'rows' ), 3 );
    assertEquals( Matrix.diag( [1, 3, 2] ).set( 3, 1, 5 ).norm( 'rows' ), 7 );
    assertEquals( Matrix.diag( [1, 3, 2] ).set( 3, 1, 5 ).scale( -1 ).norm( 'rows' ), 7 );

    assertEquals( Matrix.zeros( 3 ).norm( 'columns' ), 0 );
    assertEquals( Matrix.eye( 3 ).norm( 'columns' ), 1 );
    assertEquals( Matrix.diag( [1, 3, 2] ).norm( 'columns' ), 3 );
    assertEquals( Matrix.diag( [1, 3, 2] ).set( 3, 1, 5 ).norm( 'columns' ), 6 );
    assertEquals( Matrix.diag( [1, 3, 2] ).set( 3, 1, 5 ).scale( -1 ).norm( 'columns' ), 6 );
}, 'Matrix: Norm 3' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).isTriangular(), true );
    assertEquals( Matrix.eye( 3 ).isTriangular(), true );
    assertEquals( Matrix.eye( 2 ).set( 2, 1, 1 ).isTriangular(), true );
    assertEquals( Matrix.eye( 2 ).set( 1, 2, 1 ).isTriangular(), true );

    assertEquals( Matrix.eye( 3 ).set( 1, 3, 2 ).isTriangular( 'lower' ), true );
    assertEquals( Matrix.eye( 3 ).set( 1, 3, 2 ).isTriangular( 'upper' ), false );

    assertEquals( Matrix.eye( 3 ).set( 3, 1, 2 ).isTriangular( 'lower' ), false );
    assertEquals( Matrix.eye( 3 ).set( 3, 1, 2 ).isTriangular( 'upper' ), true );
}, 'Matrix: isTriangular' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).stringify().toMatrix(), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.ones( 3 ).stringify().toMatrix(), Matrix.ones( 3 ) );

    var M = Matrix.random( 2, 3, -5, 5, true );
    assertMatrix( M.stringify( ',', ';' ).toMatrix( ',', ';' ), M );
}, 'String: toMatrix' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).isSymmetric(), true );
    assertEquals( Matrix.eye( 3 ).isSymmetric(), true );
    assertEquals( Matrix.ones( 3 ).isSymmetric(), true );

    assertEquals( Matrix.eye( 3 ).set( 3, 1, 1 ).isSymmetric(), false );
    assertEquals( Matrix.eye( 3 ).set( 3, 1, 1 ).set( 1, 3, 1 ).isSymmetric(), true );
}, 'Matrix: isSymmetric' );

new Test( function () {
    assertArray( Matrix.zeros( 2 ).toArray(), [0, 0, 0, 0] );
    assertArray( Matrix.ones( 2 ).toArray(), [1, 1, 1, 1] );
    assertArray( Matrix.eye( 2 ).toArray(), [1, 0, 0, 1] );

    assertArray( Matrix.diag( [1, 2] ).addRow( [3, 4] ).toArray(), [1, 0, 0, 2, 3, 4] );
    assertArray( Matrix.diag( [1, 2] ).addColumn( [3, 4] ).toArray(), [1, 0, 3, 0, 2, 4] );
}, 'Matrix: toArray' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).isSameSizeAs( Matrix.zeros( 3 ) ), true );
    assertEquals( Matrix.eye( 3 ).isSameSizeAs( Matrix.eye( 3 ) ), true );
    assertEquals( Matrix.ones( 3 ).isSameSizeAs( Matrix.zeros( 3 ) ), true );

    assertEquals( Matrix.zeros( 3, 4 ).isSameSizeAs( Matrix.zeros( 3, 4 ) ), true );
    assertEquals( Matrix.zeros( 3, 4 ).isSameSizeAs( Matrix.ones( 3, 4 ) ), true );

    assertEquals( Matrix.zeros( 3 ).isSameSizeAs( Matrix.zeros( 4 ) ), false );
    assertEquals( Matrix.zeros( 3 ).isSameSizeAs( Matrix.zeros( 3, 4 ) ), false );
    assertEquals( Matrix.zeros( 4, 3 ).isSameSizeAs( Matrix.zeros( 3, 4 ) ), false );
}, 'Matrix: isSameSizeAs' );

new Test( function () {
    assertMatrix( new SparseBuilder().size( 2, 3 ).build(), new SparseMatrix( 2, 3 ) );
    assertMatrix( new SparseBuilder().size( 2, 3 ).set( 2, 2, 0 ).build(), new SparseMatrix( 2, 3 ) );
    assertMatrix( new SparseBuilder().size( 2, 3 ).set( 1, 3, 1 ).build(), new SparseMatrix( 2, 3 ).set( 1, 3, 1 ) );

    assertMatrix( new SparseBuilder()
        .size( 10, 3 )
        .set( 2, 1, 1 )
        .set( 4, 2, 2 )
        .set( 10, 3, 3 )
        .build(), new SparseMatrix( 10, 3, [1, 2, 3], [1, 2, 3], [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 3] ) );

    assertMatrix( new SparseBuilder()
        .size( 10, 3 )
        .set( 1, 3, 1 )
        .set( 9, 1, 2 )
        .build(), new SparseMatrix( 10, 3, [1, 2], [3, 1], [0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2] ) );
}, 'SparseBuilder: Build' );

new Test( function () {
    assertDimension( new SparseMatrix( 3 ), 3, 3 );
    assertDimension( new SparseMatrix( 3, 4 ), 3, 4 );
    assertDimension( new SparseMatrix( 4, 3 ), 4, 3 );

    assertDimension( new SparseBuilder().size( 3, 3 ).build(), 3, 3 );
    assertDimension( new SparseBuilder().size( 3, 4 ).build(), 3, 4 );
    assertDimension( new SparseBuilder().size( 4, 3 ).build(), 4, 3 );
}, 'SparseMatrix: Create' );

new Test( function () {
    assertEquals( new SparseMatrix( 3 ).get( 2, 3 ), 0 );
    assertEquals( new SparseMatrix( 3 ).set( 2, 2, 1 ).get( 2, 2 ), 1 );

    var M = new SparseBuilder().size( 3, 3 )
        .set( 1, 1, 1 )
        .set( 2, 2, 2 )
        .set( 3, 3, 3 )
        .set( 2, 3, 7 )
        .build();

    assertEquals( M.get( 1, 2 ), 0 );
    assertEquals( M.get( 3, 1 ), 0 );
    assertEquals( M.get( 1, 1 ), 1 );
    assertEquals( M.get( 2, 2 ), 2 );
    assertEquals( M.get( 3, 3 ), 3 );
    assertEquals( M.get( 2, 3 ), 7 );

    assertMatrix( new SparseMatrix( 3 ).set( 1, 1, 1 ).set( 2, 2, 2 ),
        new SparseMatrix( 3, 3, [1, 2], [1, 2], [0, 1, 2, 2] ) );
}, 'SparseMatrix: Get / Set' );

new Test( function () {
    assertArray( new SparseMatrix( 3 ).getRow( 3 ), [0, 0, 0] );
    assertArray( new SparseMatrix( 3 ).getColumn( 3 ), [0, 0, 0] );
}, 'SparseMatrix: Get Row / Get Column 1' );

new Test( function () {
    var M = new SparseMatrix( 4, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 1, 2, 3, 1, 2, 3], [0, 3, 3, 6, 9] );

    assertArray( M.getRow( 1 ), [1, 2, 3] );
    assertArray( M.getRow( 2 ), [0, 0, 0] );
    assertArray( M.getRow( 3 ), [4, 5, 6] );
    assertArray( M.getRow( 4 ), [7, 8, 9] );

    assertArray( M.getColumn( 1 ), [1, 0, 4, 7] );
    assertArray( M.getColumn( 2 ), [2, 0, 5, 8] );
    assertArray( M.getColumn( 3 ), [3, 0, 6, 9] );
}, 'SparseMatrix: Get Row / Get Column 2' );

new Test( function () {
    var A = new SparseMatrix( 3 ),
        B = new SparseMatrix( 3 ),
        M = new SparseMatrix( 3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 1, 2, 3, 1, 2, 3],
            [0, 3, 6, 9] );

    A.setRow( 1, [1, 2, 3] );
    A.setRow( 2, [4, 5, 6] );
    A.setRow( 3, [7, 8, 9] );

    B.setColumn( 1, [1, 4, 7] );
    B.setColumn( 2, [2, 5, 8] );
    B.setColumn( 3, [3, 6, 9] );

    assertMatrix( A, M );
    assertMatrix( B, M );
}, 'SparseMatrix: Set Row / Set Column' );

new Test( function () {
    assertEquals( new SparseMatrix( 3, 3 ).isSquare(), true );
    assertEquals( new SparseMatrix( 2, 3 ).isSquare(), false );
    assertEquals( new SparseMatrix( 3, 2 ).isSquare(), false );
}, 'SparseMatrix: isSquare' );

new Test( function () {
    assertEquals( SparseMatrix.zeros( 3 ).isSymmetric(), true );
    assertEquals( SparseMatrix.eye( 3 ).isSymmetric(), true );

    assertEquals( SparseMatrix.eye( 3 ).set( 3, 1, 1 ).isSymmetric(), false );
    assertEquals( SparseMatrix.eye( 3 ).set( 3, 1, 1 ).set( 1, 3, 1 ).isSymmetric(), true );
}, 'SparseMatrix: isSymmetric' );

// ##########

Test.runAll();

// for node-coverage
var $$_l = $$_l || { submit: function () {
} };

$$_l.submit( "matrixjs-coverage_report" );
