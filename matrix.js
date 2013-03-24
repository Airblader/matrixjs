/**
 * matrix.js
 * (C) 2013 Ingo Bürk, admin (at) airblader (dot) de
 *
 * matrix.js is a Javascript library that offers a matrix structure and calculations on matrices,
 * such as adding, multiplying, inverting, ...
 */

/**
 * Creates a new Matrix
 * @param rows Number of rows (defaults to 1)
 * @param columns Number of columns (defaults to the value of rows)
 * @constructor
 */
function Matrix (rows, columns) {
    var __rows = rows || 1,
        __columns = columns || __rows,
        __elements = [];

    this.add = function (M) {
        __elements = Matrix.add( this, M )._getElements();

        return this;
    }

    this.subtract = function (M) {
        __elements = Matrix.subtract( this, M )._getElements();

        return this;
    }

    this.scale = function (k) {
        __elements = Matrix.scale( this, k )._getElements();

        return this;
    }

    this.multiply = function (M) {
        if( typeof M === 'number' ) {
            return this.scale( M );
        }

        var result = Matrix.multiply( this, M );
        __elements = result._getElements();
        __rows = result.getDimension().rows;
        __columns = result.getDimension().columns;

        return this;
    }

    this.trace = function () {
        return Matrix.trace( this );
    }

    this.transpose = function () {
        var result = Matrix.transpose( this ),
            temp = __rows;
        __elements = result._getElements();
        __rows = __columns;
        __columns = temp;

        return this;
    }

    this.det = function () {
        return Matrix.det( this );
    }

    this.inverse = function () {
        __elements = Matrix.inverse( this )._getElements();

        return this;
    }

    this.isSquare = function () {
        return __rows === __columns;
    }

    this.get = function (row, column) {
        if( row < 1 || column < 1 || row > __rows || column > __columns ) {
            throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
        }

        return __elements[this.__getIndexFromPosition( row, column )] || 0;
    }

    this.set = function (row, column, value) {
        if( row < 1 || column < 1 || row > __rows || column > __columns ) {
            throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
        }

        var index = this.__getIndexFromPosition( row, column );
        if( __elements[index] || value !== 0 ) {
            __elements[index] = value;
        }

        return this;
    }

    this.getLength = function () {
        return __rows * __columns;
    }

    this.getDimension = function () {
        return {
            rows: __rows,
            columns: __columns
        };
    }

    this.getRow = function (row) {
        if( row < 1 || row > __rows ) {
            throw new TypeError( 'Invalid row index.' );
        }

        var start = this.__getIndexFromPosition( row, 1 ),
            elements = __elements.slice( start, start + __columns );
        for( var i = 0; i < elements.length; i++ ) {
            elements[i] = elements[i] || 0;
        }

        return elements;
    }

    this.setRow = function (row, elements) {
        if( row < 1 || row > __rows ) {
            throw new TypeError( 'Invalid row index.' );
        }
        if( elements.length !== __columns ) {
            throw new TypeError( 'Wrong number of columns in row (found '
                + elements.length + ' but expected ' + __columns + ').' );
        }

        __elements.splice.apply( __elements, [this.__getIndexFromPosition( row, 1 ), __columns].concat( elements ) );

        return this;
    }

    this.getColumn = function (column) {
        if( column < 1 || column > __columns ) {
            throw new TypeError( 'Invalid column index.' );
        }

        var start = this.__getIndexFromPosition( 1, column ),
            elements = [];
        for( var i = 0; i < __rows; i++ ) {
            elements[i] = __elements[start + i * __columns] || 0;
        }

        return elements;
    }

    this.setColumn = function (column, elements) {
        if( column < 1 || column > __columns ) {
            throw new TypeError( 'Invalid column index.' );
        }
        if( elements.length !== __rows ) {
            throw new TypeError( 'Wrong number of rows in column (found '
                + elements.length + ' but expected ' + __rows + ').' );
        }

        for( var i = 0; i < elements.length; i++ ) {
            __elements[this.__getIndexFromPosition( i + 1, column )] = elements[i];
        }

        return this;
    }

    this.__getIndexFromPosition = function (row, column) {
        return __columns * (row - 1) + column - 1;
    }

    this._getElement = function (i) {
        return __elements[i] || 0;
    }

    this._getElements = function () {
        return __elements;
    }

    this._setElements = function (elements) {
        if( __elements.length !== 0 && __elements.length !== elements.length ) {
            throw new TypeError( 'Invalid number of elements. The size of a matrix cannot be changed afterwards.' );
        }

        __elements = elements;

        return this;
    }

    this.copy = function () {
        return new Matrix( __rows, __columns )._setElements( __elements );
    }

    this.equals = function (M) {
        if( M.getDimension().rows !== __rows || M.getDimension().columns !== __columns ) {
            return false;
        }

        for( var i = 0; i < __elements.length; i++ ) {
            if( this._getElement( i ) !== M._getElement( i ) ) {
                return false;
            }
        }

        return true;
    }

    this.toString = function () {
        var str = '';
        for( var i = 1; i <= __rows; i++ ) {
            for( var j = 1; j <= __columns; j++ ) {
                str += this.get( i, j );

                if( j !== __columns ) {
                    str += '\t';
                }
            }

            if( i !== __rows ) {
                str += '\r\n';
            }
        }

        return str;
    }

    return this;
}


Matrix.add = function (A, B) {
    if( A.getDimension().rows !== B.getDimension().rows || A.getDimension().columns !== B.getDimension().columns ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var Result = new Matrix( A.getDimension().rows, A.getDimension().columns ),
        elementsResult = [];

    for( var i = 0; i < A.getLength(); i++ ) {
        if( A._getElement( i ) !== 0 && B._getElement( i ) !== 0 ) {
            elementsResult[i] = A._getElement( i ) + B._getElement( i );
        }
    }

    Result._setElements( elementsResult );

    return Result;
}

Matrix.subtract = function (A, B) {
    return Matrix.add( A, Matrix.scale( B, -1 ) );
}

Matrix.scale = function (A, k) {
    var elementsA = Array.prototype.slice.call( A._getElements() );
    for( var i = 0; i < A.getLength(); i++ ) {
        if( elementsA[i] ) {
            elementsA[i] = k * elementsA[i];
        }
    }

    return new Matrix( A.getDimension().rows, A.getDimension().columns )._setElements( elementsA );
}

Matrix.multiply = function (A, B) {
    // TODO Idea: Strassen Algorithm for big matrices

    if( A.getDimension().columns !== B.getDimension().rows ) {
        throw new TypeError( 'Inner dimensions do not match.' );
    }

    var Result = new Matrix( A.getDimension().rows, B.getDimension().columns );
    for( var i = 1; i <= Result.getDimension().rows; i++ ) {
        for( var j = 1; j <= Result.getDimension().columns; j++ ) {
            var temp = 0;
            for( var k = 1; k <= A.getDimension().columns; k++ ) {
                temp += A.get( i, k ) * B.get( k, j );
            }
            Result.set( i, j, temp );
        }
    }

    return Result;
}

Matrix.transpose = function (M) {
    var Result = new Matrix( M.getDimension().columns, M.getDimension().rows );
    for( var i = 1; i <= M.getDimension().rows; i++ ) {
        Result.setColumn( i, M.getRow( i ) );
    }

    return Result;
}

Matrix.trace = function (M) {
    if( !M.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var trace = 0;

    for( var i = 1; i <= M.getDimension().rows; i++ ) {
        trace += M.get( i, i );
    }

    return trace;
}

Matrix.LUDecomposition = function (M) {
    var m = M.getDimension().rows,
        n = M.getDimension().columns,
        swappedRows = 0,
        LU = M.copy();

    for( var k = 1; k <= m; k++ ) {
        var pivot = 0,
            maxArg = -1;

        for( var i = k; i <= m; i++ ) {
            var currArg = Math.abs( LU.get( i, k ) );

            if( currArg >= maxArg ) {
                pivot = i;
                maxArg = currArg;
            }
        }

        if( LU.get( pivot, k ) === 0 ) {
            throw new TypeError( 'Matrix is singular.' );
        }

        if( pivot !== k ) {
            var tempRow = LU.getRow( pivot );

            LU.setRow( pivot, LU.getRow( k ) );
            LU.setRow( k, tempRow );

            swappedRows++;
        }

        for( var i = k + 1; i <= m; i++ ) {
            for( var j = k + 1; j <= n; j++ ) {
                LU.set( i, j, LU.get( i, j ) - LU.get( k, j ) * ( LU.get( i, k ) / LU.get( k, k ) ) );
            }

            LU.set( i, k, 0 );
        }
    }

    // as a "hidden property" we attach the number of swapped rows
    LU.swappedRows = swappedRows;

    return LU;
}

Matrix.det = function (M) {
    /* TODO Ideas:
     *   1. Sparse matrix: Use Laplace?
     *   2. If triangular -> product of diagonal
     *   3. Direct calculation for up to 3x3 or similar
     */

    if( !M.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var n = M.getDimension().rows,
        LU = Matrix.LUDecomposition( M );

    var det = Math.pow( -1, LU.swappedRows );
    for( var i = 1; i <= n; i++ ) {
        det = det * LU.get( i, i );
    }

    return det;
}

Matrix.inverse = function (M) {
    if( !M.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var augmentedM = Matrix.augment( M, Matrix.eye( M.getDimension().rows ) );

    try {
        augmentedM = Matrix.LUDecomposition( augmentedM );

        // TODO The following two loops can probably be rewritten into something smarter
        for( var i = augmentedM.getDimension().rows; i > 1; i-- ) {
            var row = augmentedM.getRow( i ),
                factor = augmentedM.get( i - 1, i ) / augmentedM.get( i, i );

            for( var k = 0; k < row.length; k++ ) {
                augmentedM.set( i - 1, k + 1, augmentedM.get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( var i = 1; i <= augmentedM.getDimension().rows; i++ ) {
            var row = augmentedM.getRow( i );
            for( var j = 0; j < row.length; j++ ) {
                row[j] = row[j] / augmentedM.get( i, i );
            }

            augmentedM.setRow( i, row );
        }
    } catch( e ) {
        throw new TypeError( 'Matrix is not invertible.' );
    }

    return Matrix.submatrix( augmentedM,
        1, augmentedM.getDimension().rows, M.getDimension().columns + 1, augmentedM.getDimension().columns );
}

Matrix.submatrix = function (M, rowStart, rowEnd, columnStart, columnEnd) {
    var m = M.getDimension().rows,
        n = M.getDimension().columns;

    if( rowStart < 1 || rowStart > m || columnStart < 1 || columnStart > n
        || rowEnd < 1 || rowEnd > m || columnEnd < 1 || columnEnd > n
        || rowStart > rowEnd || columnStart > columnEnd ) {
        throw new TypeError( 'Invalid parameters.' );
    }

    var mResult = rowEnd - rowStart + 1,
        nResult = columnEnd - columnStart + 1;

    var Result = new Matrix( mResult, nResult );
    for( var i = rowStart; i <= rowEnd; i++ ) {
        var row = M.getRow( i ).slice( columnStart - 1, columnEnd );
        Result.setRow( i - rowStart + 1, row );
    }

    return Result;
}

Matrix.augment = function (A, B) {
    if( A.getDimension().rows !== B.getDimension().rows ) {
        throw new TypeError( 'Matrices do not have the same number of rows.' );
    }

    var Result = new Matrix( A.getDimension().rows, A.getDimension().columns + B.getDimension().columns );

    for( var i = 1; i <= A.getDimension().columns; i++ ) {
        Result.setColumn( i, A.getColumn( i ) );
    }
    for( var i = 1; i <= B.getDimension().columns; i++ ) {
        Result.setColumn( i + A.getDimension().columns, B.getColumn( i ) );
    }

    return Result;
}

Matrix.zeros = function (rows, columns) {
    if( !columns ) {
        columns = rows;
    }

    return new Matrix( rows, columns );
}

Matrix.ones = function (rows, columns) {
    if( !columns ) {
        columns = rows;
    }

    var elements = [];
    for( var i = 0; i < rows * columns; i++ ) {
        elements[i] = 1;
    }

    return new Matrix( rows, columns )._setElements( elements );
}

Matrix.eye = function (n) {
    var Result = new Matrix( n, n );
    for( var i = 1; i <= n; i++ ) {
        Result.set( i, i, 1 );
    }

    return Result;
}

Matrix.arrayToMatrix = function (elements, rows, columns) {
    if( !rows && !columns ) {
        var sqrtNumberOfElements = Number( Math.sqrt( elements.length ) );
        if( isNaN( sqrtNumberOfElements ) ) {
            throw new TypeError( 'Number of elements is not a square number.' );
        } else {
            rows = sqrtNumberOfElements;
            columns = sqrtNumberOfElements;
        }
    } else if( !rows || !columns ) {
        // TODO : Allow to pass one, but not both parameters and calculate the other one if possible
        throw new TypeError( 'Array has to be square matrix or size has to be given.' );
    }

    return new Matrix( rows, columns )._setElements( elements );
}


// ######################
// Allow more than 2 arguments for add etc.
// eigenvalues, eigenvectors
// LGS
// way more validation


// ####################################
// ### TESTS
// ####################################

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
