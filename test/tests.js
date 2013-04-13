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
    assertDimension( new Matrix( 3, 3 ), 3, 3 );
}, 'Create Matrix 1' );

new Test( function () {
    assertDimension( new Matrix( 3, 4 ), 3, 4 );
}, 'Create Matrix 2' );

new Test( function () {
    assertDimension( new Matrix( 4, 3 ), 4, 3 );
}, 'Create Matrix 3' );

new Test( function () {
    assertDimension( new Matrix( 3 ), 3, 3 );
}, 'Create Matrix 4' );

new Test( function () {
    assertDimension( new Matrix( [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ] ), 3, 3 );
}, 'Create Matrix 5' );

new Test( function () {
    assertMatrix( new Matrix( [1, 0, 0, 0, 1, 0, 0, 0, 1] ), Matrix.eye( 3 ) );
}, 'Create Matrix 6' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Create Matrix 7' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Create Matrix 8' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], null, 3 ), new Matrix( [
        [1, 2, 3],
        [4, 5, 6]
    ] ) );
}, 'Create Matrix 9' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).get( 2, 3 ), 0 );
}, 'Set/Get Single Element 1' );

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
}, 'Set/Get Single Element 2' );

new Test( function () {
    var M = new Matrix( 3 );

    assertEquals( M.size(), 9 );
    assertEquals( M.isSquare(), true );
    assertEquals( M.isVector(), false );

    assertEquals( Matrix.zeros( 1, 3 ).isVector(), true );
    assertEquals( Matrix.zeros( 3, 1 ).isVector(), true );
}, 'Helper Methods 1' );

new Test( function () {
    var M = new Matrix( 2, 3 );

    assertEquals( M.size(), 6 );
    assertEquals( M.isSquare(), false );
    assertEquals( M.isVector(), false );
}, 'Helper Methods 2' );

new Test( function () {
    assertArray( Matrix.zeros( 3 ).getRow( 3 ), [0, 0, 0] );
    assertArray( Matrix.zeros( 3 ).getColumn( 3 ), [0, 0, 0] );
}, 'Get Row/Column 1' );

new Test( function () {
    var M = new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );

    assertArray( M.getRow( 1 ), [1, 2, 3] );
    assertArray( M.getRow( 2 ), [4, 5, 6] );
    assertArray( M.getRow( 3 ), [7, 8, 9] );

    assertArray( M.getColumn( 1 ), [1, 4, 7] );
    assertArray( M.getColumn( 2 ), [2, 5, 8] );
    assertArray( M.getColumn( 3 ), [3, 6, 9] );
}, 'Get Row/Column 2' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).getRow( 2 ) instanceof Matrix, false );
    assertEquals( Matrix.zeros( 3 ).getRow( 2, false ) instanceof Matrix, false );
    assertEquals( Matrix.zeros( 3 ).getRow( 2, true ) instanceof Matrix, true );

    assertEquals( Matrix.zeros( 3 ).getColumn( 2 ) instanceof Matrix, false );
    assertEquals( Matrix.zeros( 3 ).getColumn( 2, false ) instanceof Matrix, false );
    assertEquals( Matrix.zeros( 3 ).getColumn( 2, true ) instanceof Matrix, true );
}, 'Get Row/Column 3' );

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
}, 'Set Row/Column 1' );

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
}, 'Set Row/Column 2' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).add( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
}, 'Add/Subtract Matrices 1' );

new Test( function () {
    var A = new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ),
        B = new Matrix( [9, 8, 7, 6, 5, 4, 3, 2, 1] );

    assertMatrix( A.add( A ), A.scale( 2 ) );
    assertMatrix( A.add( B ), Matrix.ones( 3 ).scale( 10 ) );
}, 'Add/Subtract Matrices 2' );

new Test( function () {
    var A = Matrix.ones( 3 ).scale( 2 ),
        B = Matrix.ones( 3 );

    assertMatrix( A.subtract( A ), Matrix.zeros( 3 ) );
    assertMatrix( A.subtract( B ), Matrix.ones( 3 ) );

    assertMatrix( B.add( B, B ), Matrix.ones( 3 ).scale( 3 ) );
    assertMatrix( Matrix.ones( 3 ).scale( 2 ).subtract( Matrix.ones( 3 ), Matrix.ones( 3 ) ),
        Matrix.zeros( 3 ) );
}, 'Add/Subtract Matrices 3' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.zeros( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.zeros( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.eye( 3 ).multiply( Matrix.eye( 3 ) ), Matrix.eye( 3 ) );
}, 'Multiply 1' );

new Test( function () {
    var A = new Matrix( [1, 2, 1, 2, 3, 2, 3, 4, 3] ),
        B = new Matrix( [1, 0, 1, 2, 1, 2, 3, 2, 3] );

    assertMatrix( A.multiply( B ), new Matrix( [8, 4, 8, 14, 7, 14, 20, 10, 20] ) );
    assertMatrix( B.multiply( A ), new Matrix( [4, 6, 4, 10, 15, 10, 16, 24, 16] ) );
}, 'Multiply 2' );

new Test( function () {
    var A = new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ),
        B = new Matrix( [1, 2, 3, 4, 5, 6], 3, 2 );

    assertMatrix( A.multiply( B ), new Matrix( [22, 28, 49, 64], 2, 2 ) );
}, 'Multiply 3' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).trace(), 0 );
    assertEquals( Matrix.eye( 5 ).trace(), 5 );
}, 'Trace 1' );

new Test( function () {
    var M = Matrix.ones( 3 ).set( 1, 1, 2 ).set( 2, 2, 3 ).set( 3, 3, 5 );
    assertEquals( M.trace(), 10 );
}, 'Trace 2' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).transpose(), Matrix.zeros( 3 ) );
}, 'Transpose 1' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).transpose(), Matrix.eye( 3 ) );
}, 'Transpose 2' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] ).transpose(),
        new Matrix( [1, 4, 7, 2, 5, 8, 3, 6, 9] ) );
}, 'Transpose 3' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ).transpose(),
        new Matrix( [1, 4, 2, 5, 3, 6], 3, 2 ) );
}, 'Transpose 4' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).det(), 0 );
    assertEquals( Matrix.eye( 3 ).det(), 1 );
}, 'Determinant 1' );

new Test( function () {
    assertEquals( new Matrix( [1, 2, 3, 1, 1, 1, 3, 3, 1], 3, 3 ).det(), 2 );
}, 'Determinant 2' );

new Test( function () {
    assertEquals( new Matrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 ).det(), -12 );
}, 'Determinant 3' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).inverse(), Matrix.eye( 3 ) );
}, 'Inverse 1' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).inverse(), Matrix.eye( 3 ).scale( 0.5 ) );
}, 'Inverse 2' );

new Test( function () {
    assertMatrix( new Matrix( [4, 7, 2, 6], 2, 2 ).inverse(),
        new Matrix( [0.6, -0.7, -0.2, 0.4], 2, 2 ) );
}, 'Inverse 3' );

new Test( function () {
    assertException( function () {
        Matrix.zeros( 3 ).inverse();
    } );
}, 'Inverse 4' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).submatrix( 2, 3, 2, 3 ), Matrix.zeros( 2 ) );
}, 'Submatrix 1' );

new Test( function () {
    var M = new Matrix( [1, 2, 3, 3, 2, 1, 2, 1, 3], 3, 3 );

    assertMatrix( M.submatrix( 1, 3, 1, 3 ), M );
    assertMatrix( M.submatrix( 2, 3, 2, 3 ), new Matrix( [2, 1, 1, 3], 2, 2 ) );
}, 'Submatrix 2' );

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
}, 'Diag 1' );

new Test( function () {
    assertArray( Matrix.zeros( 3 ).diag(), [0, 0, 0] );
}, 'Diag 2' );

new Test( function () {
    assertMatrix( Matrix.diag( [1, 1, 1] ), Matrix.eye( 3 ) );
}, 'Diag 3' );

new Test( function () {
    assertMatrix( Matrix.diag( [0, 0, 0] ), Matrix.zeros( 3 ) );
}, 'Diag 4' );

new Test( function () {
    assertMatrix( Matrix.diag( [1, 2], 1 ), new Matrix( [
        [0, 1, 0],
        [0, 0, 2],
        [0, 0, 0]
    ] ) );
}, 'Diag 5' );

new Test( function () {
    assertMatrix( Matrix.diag( [1, 2], -1 ), new Matrix( [
        [0, 0, 0],
        [1, 0, 0],
        [0, 2, 0]
    ] ) );
}, 'Diag 6' );

new Test( function () {
    assertMatrix( Matrix.diag( [1, 2, 3] ), new Matrix( [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
    ] ) );
}, 'Diag 7' );

new Test( function () {
    assertMatrix( Matrix.diag( Matrix.ones( 1, 3 ) ), Matrix.eye( 3 ) );
}, '' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).roundTo( 0 ), Matrix.zeros( 3 ) );
}, 'RoundTo 1' );

new Test( function () {
    var M = new Matrix( [
        [1.1, 0, 0],
        [0, 2.1, 0],
        [0, 0, 3.1]
    ] ).scale( 0.5 );

    assertArray( M.roundTo( 0 ).diag(), [1, 1, 2] );
    assertArray( M.roundTo( 1 ).diag(), [0.6, 1.1, 1.6] );
}, 'RoundTo 2' );

new Test( function () {
    var M = Matrix.zeros( 3, 1 );

    assertEquals( M.dot( M ), 0 );
}, 'Dot Product 1' );

new Test( function () {
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
}, 'Dot Product 2' );

new Test( function () {
    assertEquals( Matrix.eye( 3 ).contains( 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 0 ), true );
}, 'Contains 1' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).contains( 0 ), true );
}, 'Contains 2' );

new Test( function () {
    assertEquals( Matrix.eye( 3 ).contains( 2 ), false );
    assertEquals( Matrix.ones( 3 ).contains( 0 ), false );
}, 'Contains 3' );

new Test( function () {
    assertEquals( new Matrix( [
        [0, 0, 1]
    ] ).contains( 1 ), true );
}, 'Contains 4' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).set( 3, 3, 1 ).contains( 1 ), true );
}, 'Contains 5' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).contains( 0.5, 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 0.5, 1 ), true );
    assertEquals( Matrix.eye( 3 ).contains( 2, 0.5 ), false );
}, 'Contains 6' );

new Test( function () {
    var A = Matrix.eye( 3 ),
        B = Matrix.zeros( 3 );

    assertEquals( A.equals( A ), true );
    assertEquals( A.equals( B ), false );
    assertEquals( B.equals( B ), true );
}, 'Equals 1' );

new Test( function () {
    var A = Matrix.ones( 2, 3 ),
        B = Matrix.ones( 3, 2 ),
        C = Matrix.zeros( 2, 3 );

    assertEquals( A.equals( B ), false );
    assertEquals( A.equals( C ), false );
}, 'Equals 2' );

new Test( function () {
    var M = Matrix.zeros( 3 );

    assertMatrix( M.abs(), M );
}, 'Abs 1' );

new Test( function () {
    var A = Matrix.eye( 3 ),
        B = Matrix.ones( 3 ),
        C = B.subtract( A.scale( 2 ) );

    assertMatrix( A.abs(), A );
    assertMatrix( B.abs(), B );
    assertMatrix( C.abs(), B );
}, 'Abs 2' );

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
}, 'Cross Product 1' );

new Test( function () {
    var M = Matrix.eye( 3 );

    assertEquals( M.dim( 1 ), 3 );
    assertEquals( M.dim( 2 ), 3 );
}, 'Get Dimensions 1' );

new Test( function () {
    var M = Matrix.ones( 2, 3 );

    assertEquals( M.dim( 1 ), 2 );
    assertEquals( M.dim( 2 ), 3 );
    assertEquals( M.dim( 'rows' ), 2 );
    assertEquals( M.dim( 'columns' ), 3 );
}, 'Get Dimensions 2' );

new Test( function () {
    var M = Matrix.zeros( 3, 2 );

    assertEquals( M.dim( 1 ), 3 );
    assertEquals( M.dim( 2 ), 2 );
}, 'Get Dimensions 3' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4] ).addColumn( [5, 6] ), new Matrix( [1, 2, 5, 3, 4, 6], 2, 3 ) );
}, 'Add Column 1' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).addColumn( Matrix.zeros( 3 ).getColumn( 1 ) ), Matrix.zeros( 3, 4 ) );
}, 'Add Column 2' );

new Test( function () {
    assertMatrix( Matrix.eye( 2 ).addColumn( Matrix.ones( 2, 1 ) ), new Matrix( [1, 0, 1, 0, 1, 1], 2, 3 ) );
}, 'Add Column 3' );

new Test( function () {
    assertMatrix( new Matrix( [1, 2, 3, 4] ).addRow( [5, 6] ), new Matrix( [1, 2, 3, 4, 5, 6], 3, 2 ) );
}, 'Add Row 1' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).addRow( Matrix.zeros( 3 ).getRow( 1 ) ), Matrix.zeros( 4, 3 ) );
}, 'Add Row 2' );

new Test( function () {
    assertMatrix( Matrix.eye( 2 ).addRow( Matrix.ones( 1, 2 ) ), new Matrix( [1, 0, 0, 1, 1, 1], 3, 2 ) );
}, 'Add Row 3' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).fun( function (value) {
        return value + 1;
    } ), Matrix.ones( 3 ) );
}, 'Apply 1' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).fun( function (value) {
        return value + 1;
    }, Matrix.filters.diag ), Matrix.eye( 3 ) );
}, 'Apply 2' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).fun( function (value, row, column) {
        return value + row * column;
    } ), new Matrix( [2, 2, 3, 2, 5, 6, 3, 6, 10] ) );
}, 'Apply 2' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).fun( Matrix.applicators.square ),
        Matrix.eye( 3 ).scale( 4 ) );
}, 'Apply 3' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).spfun( function (value) {
        return value + 1;
    } ), Matrix.eye( 3 ).scale( 2 ) );
}, 'Non-Zero Apply 1' );

new Test( function () {
    var e = Math.E;
    assertMatrix( Matrix.eye( 3 ).pw_exp(), new Matrix( [e, 1, 1, 1, e, 1, 1, 1, e] ) );
}, 'Exp 1' );

new Test( function () {
    assertMatrix( Matrix.eye( 3 ).scale( 2 ).pw_pow( 3 ), Matrix.eye( 3 ).scale( 8 ) );
}, 'Pow 1' );

new Test( function () {
    assertMatrix( [0, 0, 0, 0].toMatrix(), Matrix.zeros( 2 ) );
    assertMatrix( [1, 2, 3, 4, 5, 6].toMatrix( 2, 3 ), new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 ) );
}, 'Array to Matrix' );

new Test( function () {
    assertMatrix( [1, 2, 3, 4, 5, 6].toVector(), new Matrix( [1, 2, 3, 4, 5, 6], 6, 1 ) );
    assertMatrix( [1, 2, 3, 4, 5, 6].toVector( true ), new Matrix( [1, 2, 3, 4, 5, 6], 1, 6 ) );
}, 'Array to Vector' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).norm( 'p', 2 ), 0 );
    assertEquals( Matrix.eye( 4 ).norm( 'p', 2 ), 2 );
    assertEquals( Matrix.ones( 3 ).norm( 'p', 2 ), 3 );

    assertEquals( Matrix.diag( [1, 2, 1, 2, 1, 2] ).norm( 'p', 3 ), 3 );
}, 'Norm 1' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).norm( 'max' ), 0 );
    assertEquals( Matrix.eye( 3 ).norm( 'max' ), 1 );
    assertEquals( Matrix.zeros( 5 ).set( 3, 4, 10 ).norm( 'max' ), 10 );
    assertEquals( Matrix.zeros( 5 ).set( 3, 4, -10 ).norm( 'max' ), 10 );
}, 'Norm 2' );

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
}, 'Norm 3' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).isTriangular(), true );
    assertEquals( Matrix.eye( 3 ).isTriangular(), true );
    assertEquals( Matrix.eye( 2 ).set( 2, 1, 1 ).isTriangular(), true );
    assertEquals( Matrix.eye( 2 ).set( 1, 2, 1 ).isTriangular(), true );
}, 'Is Triangular 1' );

new Test( function () {
    assertEquals( Matrix.eye( 3 ).set( 1, 3, 2 ).isTriangular( 'lower' ), true );
    assertEquals( Matrix.eye( 3 ).set( 1, 3, 2 ).isTriangular( 'upper' ), false );

    assertEquals( Matrix.eye( 3 ).set( 3, 1, 2 ).isTriangular( 'lower' ), false );
    assertEquals( Matrix.eye( 3 ).set( 3, 1, 2 ).isTriangular( 'upper' ), true );
}, 'Is Triangular 2' );

new Test( function () {
    assertMatrix( Matrix.zeros( 3 ).stringify().toMatrix(), Matrix.zeros( 3 ) );
    assertMatrix( Matrix.ones( 3 ).stringify().toMatrix(), Matrix.ones( 3 ) );

    var M = Matrix.random( 2, 3, -5, 5, true );
    assertMatrix( M.stringify( ',', ';' ).toMatrix( ',', ';' ), M );
}, 'String to Matrix 1' );

new Test( function () {
    assertEquals( Matrix.zeros( 3 ).isSymmetric(), true );
    assertEquals( Matrix.eye( 3 ).isSymmetric(), true );
    assertEquals( Matrix.ones( 3 ).isSymmetric(), true );

    assertEquals( Matrix.eye( 3 ).set( 3, 1, 1 ).isSymmetric(), false );
    assertEquals( Matrix.eye( 3 ).set( 3, 1, 1 ).set( 1, 3, 1 ).isSymmetric(), true );
}, 'Is Symmetric 1' );

new Test( function () {
    var M;

    for( var i = 1; i <= 20; i++ ) {
        M = Matrix.random( 100, 100, -10, 10, true );
        M.pw_exp().det();
    }
}, 'Big Matrices Performance Test', true );

// ##########

Test.runAll();