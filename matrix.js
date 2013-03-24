/**
 * matrix.js
 * (C) 2013 Ingo Bürk, admin (at) airblader (dot) de
 * This library is protected with the MIT License.
 *
 * matrix.js is a Javascript library that offers a matrix structure and calculations on matrices,
 * such as adding, multiplying, inverting, ...
 */

/**
 * Creates a new Matrix
 * @constructor
 */
function Matrix () {
    var args = [].slice.call( arguments ),
        __rows, __columns,
        __elements = [];

    if( args.length === 1 && args[0] instanceof Array ) {
        __rows = args[0].length;
        __columns = -1;

        for( var i = 0; i < args[0].length; i++ ) {
            if( args[0][i].length !== __columns && __columns !== -1 ) {
                throw new TypeError( 'Invalid parameters.' );
            }
            __columns = Math.max( __columns, args[0][i].length );

            for( var j = 0; j < args[0][i].length; j++ ) {
                __elements.push( args[0][i][j] );
            }
        }
    } else if( args.length === 1 ) {
        __rows = args[0];
        __columns = args[0];
    } else if( args.length === 2 ) {
        __rows = args[0];
        __columns = args[1];
    } else {
        throw new TypeError( 'Invalid parameters.' );
    }


    this.add = function (M) {
        return Matrix.add( this, M );
    }

    this.subtract = function (M) {
        return Matrix.subtract( this, M );
    }

    this.scale = function (k) {
        return Matrix.scale( this, k );
    }

    this.multiply = function (M) {
        if( typeof M === 'number' ) {
            return this.scale( M );
        }

        return Matrix.multiply( this, M );
    }

    this.trace = function () {
        return Matrix.trace( this );
    }

    this.transpose = function () {
        return Matrix.transpose( this );
    }

    this.det = function () {
        return Matrix.det( this );
    }

    this.inverse = function () {
        return Matrix.inverse( this );
    }

    this.submatrix = function (rowStart, rowEnd, columnStart, columnEnd) {
        return Matrix.submatrix( rowstart, rowEnd, columnStart, columnEnd );
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

    this.contains = function (needle) {
        return __elements.indexOf( needle );
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


/**
 * Calculate the sum of two matrices.
 * If more than two matrices are passed, they will be added in order, i.e. A + B + C + ...
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Component-wise sum of A and B, i.e. A+B.
 */
Matrix.add = function (A, B) {
    if( arguments.length > 2 ) {
        var args = [].slice.call( arguments );
        args.unshift( Matrix.add( args.shift(), args.shift() ) );

        return Matrix.add.apply( this, args );
    }

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

/**
 * Calculate the difference of two matrices.
 * If more than two matrices are passed, they wll be subtracted in order, i.e. A - B - C - ...
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Component-wise difference of A and B, i.e. A-B.
 */
Matrix.subtract = function (A, B) {
    if( arguments.length > 2 ) {
        var args = [].slice.call( arguments );
        args.unshift( Matrix.subtract( args.shift(), args.shift() ) );

        return Matrix.subtract.apply( this, args );
    }

    return Matrix.add( A, Matrix.scale( B, -1 ) );
}

/**
 * Scale a matrix with a factor (i.e. calculate k * A)
 * @param {Matrix} A Matrix
 * @param {Number} k Factor
 * @returns {Matrix} Matrix A with all entries multiplied by k.
 */
Matrix.scale = function (A, k) {
    if( typeof k !== 'number' || isNaN( k ) ) {
        throw new TypeError( 'Factor is not a number.' );
    }

    var elementsA = Array.prototype.slice.call( A._getElements() );
    for( var i = 0; i < A.getLength(); i++ ) {
        if( elementsA[i] ) {
            elementsA[i] = k * elementsA[i];
        }
    }

    return new Matrix( A.getDimension().rows, A.getDimension().columns )._setElements( elementsA );
}

/**
 * Multiply two matrices.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Matrix A * B.
 */
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

/**
 * Transpose a matrix, i.e. take the rows as the columns of the resulting matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Transposed matrix M^T
 */
Matrix.transpose = function (M) {
    var Result = new Matrix( M.getDimension().columns, M.getDimension().rows );
    for( var i = 1; i <= M.getDimension().rows; i++ ) {
        Result.setColumn( i, M.getRow( i ) );
    }

    return Result;
}

/**
 * Calculate the trace of a matrix, i.e. the sum of all diagonal entries.
 * @param {Matrix} M Matrix
 * @returns {Number} Sum of diagonal entries.
 */
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

/**
 * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
 * diagonal entries will not be stored.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix with the LU entries. There is also a hidden property swappedRows with the number
 * of rows that were swapped in the process.
 */
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

/**
 * Calculate the determinant of a Matrix.
 * @param {Matrix} M Matrix
 * @returns {Number} Determinant of M.
 */
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

/**
 * Calculate the inverse of a Matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Inverse of M, a.k.a. M^(-1).
 */
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

/**
 * Extract a submatrix.
 * @param {Matrix} M Matrix
 * @param {Number} rowStart Row index where to start the cut
 * @param {Number} rowEnd Row index where to end the cut
 * @param {Number} columnStart Column index where to start the cut
 * @param {Number} columnEnd Column index where to end the cut
 * @returns {Matrix} Submatrix of M in the specified area.
 */
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

/**
 * Augment to matrices.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Augmented matrix A|B.
 */
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

/**
 * Returns a matrix of zeros.
 * @param {Number} rows Number of rows
 * @param {Number} columns Number of columns (defaults to the value of rows)
 * @returns {Matrix} A new matrix of the specified size containing zeros everywhere.
 */
Matrix.zeros = function (rows, columns) {
    if( !columns ) {
        columns = rows;
    }

    return new Matrix( rows, columns );
}

/**
 * Returns a matrix of ones.
 * @param {Number} rows Number of rows
 * @param {Number} [columns=rows] Number of columns
 * @returns {Matrix} A new matrix of the specified size containing ones everywhere.
 */
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

/**
 * Returns an identity matrix.
 * @param {Number} n Size of the matrix
 * @returns {Matrix} A new n-by-n identity matrix.
 */
Matrix.eye = function (n) {
    var Result = new Matrix( n, n );
    for( var i = 1; i <= n; i++ ) {
        Result.set( i, i, 1 );
    }

    return Result;
}

/**
 * Returns a diagonal matrix.
 * @param {Array} elements Array of diagonal elements
 * @returns {Matrix} Matrix with the specified elements on its diagonal.
 */
Matrix.diag = function (elements) {
    var Result = new Matrix( elements.length );
    for( var i = 1; i <= Result.getDimension().rows; i++ ) {
        Result.set( i, i, elements[i] );
    }

    return Result;
}

/**
 * Creates and returns a matrix from an array of elements.
 * If no size arguments (rows, columns) are given and the number of elements is a square number, a square matrix
 * will be created.
 * @param {Number[]} elements Array of elements, wherein the elements are listed from left to right, top to bottom.
 * @param {Number} rows Number of rows
 * @param {Number} columns Number of columns
 * @returns {Matrix} A new matrix containing the given elements as entries.
 * @deprecated
 */
Matrix.arrayToMatrix = function (elements, rows, columns) {
    if( !rows && !columns ) {
        var sqrtNumberOfElements = Number( Math.sqrt( elements.length ) );
        if( ( sqrtNumberOfElements | 0 ) !== sqrtNumberOfElements ) {
            throw new TypeError( 'Number of elements is not a square number.' );
        } else {
            rows = sqrtNumberOfElements;
            columns = sqrtNumberOfElements;
        }
    } else if( !rows && typeof columns === 'number' ) {
        rows = Number( elements.length / columns );
    } else if( typeof rows === 'number' && !columns ) {
        columns = Number( elements.length / rows );
    }

    if( ( rows | 0 ) !== rows || ( columns | 0 ) !== columns ) {
        throw new TypeError( 'Array has to represent a square matrix or the size has to be specified.' );
    }

    return new Matrix( rows, columns )._setElements( elements );
}


// ######################
// Allow more than 2 arguments for multiply etc.
// eigenvalues, eigenvectors
// dot product, cross product
// move arrayToMatrix to constructor
// roundTo
// rank
// getDiag, getMinor
// LGS