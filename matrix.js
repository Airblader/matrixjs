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
        return (typeof M === 'number') ? this.scale( M ) : Matrix.multiply( this, M );
    }

    this.mult = function (M) {
        return this.multiply( M );
    }

    this.dot = function (M) {
        return Matrix.dot( this, M );
    }

    this.cross = function (M) {
        return Matrix.cross( this, M );
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
        return Matrix.submatrix( this, rowStart, rowEnd, columnStart, columnEnd );
    }

    this.isSquare = function () {
        return __rows === __columns;
    }

    this.isVector = function () {
        return __rows === 1 || __columns === 1;
    }

    /**
     * Get an element in the matrix.
     * If called with one argument, the matrix will be accessed in a linear way (left to right, top to bottom).
     * If called with two arguments i and j, it will return the (i,j)-th element.
     * @returns {Number} Specified element of the matrix.
     */
    this.get = function () {
        if( arguments.length === 1 ) {
            var index = arguments[0];

            if( index < 1 || index > this.getLength() ) {
                throw new TypeError( 'Cannot access element at index ' + index );
            }

            return __elements[index - 1] || 0;
        } else if( arguments.length === 2 ) {
            var row = arguments[0],
                column = arguments[1];

            if( row < 1 || column < 1 || row > __rows || column > __columns ) {
                throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
            }

            return __elements[this.__convertToIndex( row, column )] || 0;
        } else {
            throw new TypeError( 'Invalid number of arguments.' );
        }
    }

    /**
     * Set an element in the matrix.
     * If called with two arguments, the first argument specifies the linear position of the entry (left to right,
     * top to bottom) and the second the new value. If called with three arguments i, j and x, it will assign x to
     * the (i,j)-th element.
     */
    this.set = function () {
        if( arguments.length === 2 ) {
            var index = arguments[0],
                value = arguments[1];

            if( index < 1 || index > this.getLength() ) {
                throw new TypeError( 'Cannot access element at index ' + index );
            }

            if( value !== 0 ) {
                __elements[index - 1] = value;
            }
        } else if( arguments.length === 3 ) {
            var row = arguments[0],
                column = arguments[1],
                value = arguments[2];

            if( row < 1 || column < 1 || row > __rows || column > __columns ) {
                throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
            }

            var index = this.__convertToIndex( row, column );
            if( __elements[index] || value !== 0 ) {
                __elements[index] = value;
            }
        } else {
            throw new TypeError( 'Invalid number of arguments.' );
        }

        return this;
    }

    /**
     * Get the number of elements in the matrix.
     * @returns {Number} Number of elements (number of rows times number of columns).
     */
    this.getLength = function () {
        return __rows * __columns;
    }

    /**
     * Get the dimensions of the matrix.
     * @returns {{rows: Number, columns: Number}} Object containing the number of rows/columns in the matrix.
     */
    this.getDimensions = function () {
        return {
            rows: __rows,
            columns: __columns
        };
    }

    /**
     * Get the dimensions of the matrix.
     * Without any arguments, this is a short-hand notation for <Matrix>.getDimensions(). If called with the argument
     * 1 or 'rows', it returns the number of rows. If called with 2 or 'columns', it returns the number of columns.
     * @returns {{rows: Number, columns: Number}|Number} Object with the dimensions of requested dimension or just
     * the requested dimension.
     */
    this.dim = function () {
        var dim = this.getDimensions();

        if( arguments.length === 0 ) {
            return dim;
        } else if( arguments.length === 1 ) {
            var requestedDim = arguments[0];
            if( requestedDim === 1 || requestedDim === 'rows' ) {
                return dim.rows;
            } else if( requestedDim === 2 || requestedDim === 'columns' ) {
                return dim.columns;
            }
        }

        throw new TypeError( 'Invalid parameter(s).' );
    }

    this.getRow = function (row) {
        if( row < 1 || row > __rows ) {
            throw new TypeError( 'Invalid row index.' );
        }

        var start = this.__convertToIndex( row, 1 ),
            elements = __elements.slice( start, start + __columns );
        for( var i = 0; i < __columns; i++ ) {
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

        __elements.splice.apply( __elements, [this.__convertToIndex( row, 1 ), __columns].concat( elements ) );

        return this;
    }

    this.getColumn = function (column) {
        if( column < 1 || column > __columns ) {
            throw new TypeError( 'Invalid column index.' );
        }

        var start = this.__convertToIndex( 1, column ),
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
            __elements[this.__convertToIndex( i + 1, column )] = elements[i];
        }

        return this;
    }

    /**
     * Get the diagonal of the matrix.
     * @param {Number} [k=0] Specified which diagonal to return, i.e. 1 for the first upper secondary diagonal.
     * @returns {Number[]} Diagonal of the matrix.
     */
    this.diag = function (k) {
        k = k || 0;

        var diag = [],
            rowOffset = -Math.min( k, 0 ),
            columnOffset = Math.max( k, 0 ),
            endOfLoop = (rowOffset === 0 ) ? (__columns - columnOffset) : (__rows - rowOffset);

        if( endOfLoop <= 0 ) {
            throw new TypeError( 'Matrix does not have that many diagonals.' );
        }

        for( var i = 1; i <= endOfLoop; i++ ) {
            diag.push( this.get( i + rowOffset, i + columnOffset ) );
        }

        return diag;
    }

    this.round = function () {
        return this.roundTo( 0 );
    }

    this.roundTo = function (precision) {
        return Matrix.roundTo( this, precision );
    }

    this.abs = function () {
        return Matrix.abs( this );
    }

    this.__convertToIndex = function (row, column) {
        return __columns * (row - 1) + column - 1;
    }

    this.__getElement = function (i) {
        return __elements[i] || 0;
    }

    this.__getElements = function () {
        return __elements;
    }

    this.__setElements = function (elements) {
        if( __elements.length !== 0 && __elements.length !== elements.length ) {
            throw new TypeError( 'Invalid number of elements. The size of a matrix cannot be changed afterwards.' );
        }

        __elements = elements;

        return this;
    }

    this.getDominantDimension = function () {
        return Math.max( __rows, __columns );
    }

    this.copy = function () {
        // TODO can be shortened when constructor is capable of more
        return new Matrix( __rows, __columns ).__setElements( [].slice.call( __elements ) );
    }

    this.contains = function (needle) {
        if( needle !== 0 ) {
            return __elements.indexOf( needle ) !== -1;
        } else {
            for( var i = 1; i <= this.getLength(); i++ ) {
                if( this.get( i ) === 0 ) {
                    return true;
                }
            }

            return false;
        }
    }

    this.equals = function (M) {
        if( M.dim( 1 ) !== __rows || M.dim( 2 ) !== __columns ) {
            return false;
        }

        for( var i = 0; i < this.getLength(); i++ ) {
            if( this.__getElement( i ) !== M.__getElement( i ) ) {
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

    if( A.dim( 1 ) !== B.dim( 1 ) || A.dim( 2 ) !== B.dim( 2 ) ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var Result = new Matrix( A.dim( 1 ), A.dim( 2 ) ),
        elementsResult = [];

    for( var i = 0; i < A.getLength(); i++ ) {
        if( A.__getElement( i ) !== 0 && B.__getElement( i ) !== 0 ) {
            elementsResult[i] = A.__getElement( i ) + B.__getElement( i );
        }
    }

    Result.__setElements( elementsResult );

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

    var elementsA = Array.prototype.slice.call( A.__getElements() );
    for( var i = 0; i < A.getLength(); i++ ) {
        if( elementsA[i] ) {
            elementsA[i] = k * elementsA[i];
        }
    }

    return new Matrix( A.dim( 1 ), A.dim( 2 ) ).__setElements( elementsA );
}

/**
 * Multiply two matrices.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Matrix A * B.
 */
Matrix.multiply = function (A, B) {
    // TODO Idea: Strassen Algorithm for big matrices

    if( A.dim( 2 ) !== B.dim( 1 ) ) {
        throw new TypeError( 'Inner dimensions do not match.' );
    }

    var Result = new Matrix( A.dim( 1 ), B.dim( 2 ) );
    for( var i = 1; i <= Result.dim( 1 ); i++ ) {
        for( var j = 1; j <= Result.dim( 2 ); j++ ) {
            var temp = 0;
            for( var k = 1; k <= A.dim( 2 ); k++ ) {
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
    var Result = new Matrix( M.dim( 2 ), M.dim( 1 ) );
    for( var i = 1; i <= M.dim( 1 ); i++ ) {
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

    for( var i = 1; i <= M.dim( 1 ); i++ ) {
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
    var m = M.dim( 1 ),
        n = M.dim( 2 ),
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

    var n = M.dim( 1 ),
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

    var augmentedM = Matrix.augment( M, Matrix.eye( M.dim( 1 ) ) );

    try {
        augmentedM = Matrix.LUDecomposition( augmentedM );

        // TODO The following two loops can probably be rewritten into something smarter
        for( var i = augmentedM.dim( 1 ); i > 1; i-- ) {
            var row = augmentedM.getRow( i ),
                factor = augmentedM.get( i - 1, i ) / augmentedM.get( i, i );

            for( var k = 0; k < row.length; k++ ) {
                augmentedM.set( i - 1, k + 1, augmentedM.get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( var i = 1; i <= augmentedM.dim( 1 ); i++ ) {
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
        1, augmentedM.dim( 1 ), M.dim( 2 ) + 1, augmentedM.dim( 2 ) );
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
    var m = M.dim( 1 ),
        n = M.dim( 2 );

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
    if( A.dim( 1 ) !== B.dim( 1 ) ) {
        throw new TypeError( 'Matrices do not have the same number of rows.' );
    }

    var Result = new Matrix( A.dim( 1 ), A.dim( 2 ) + B.dim( 2 ) );

    for( var i = 1; i <= A.dim( 2 ); i++ ) {
        Result.setColumn( i, A.getColumn( i ) );
    }
    for( var i = 1; i <= B.dim( 2 ); i++ ) {
        Result.setColumn( i + A.dim( 2 ), B.getColumn( i ) );
    }

    return Result;
}

/**
 * Calculate the dot product of two vectors. It doesn't matter whether the vectors are row or column vectors.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Number} Euclidean dot product of A and B.
 */
Matrix.dot = function (A, B) {
    if( !A.isVector() || !B.isVector() ) {
        throw new TypeError( 'Parameter is not a vector.' );
    }

    var dimA = A.getDominantDimension(),
        dimB = B.getDominantDimension();

    if( dimA !== dimB ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var result = 0;
    for( var i = 1; i <= dimA; i++ ) {
        result += A.get( i ) * B.get( i );
    }

    return result;
}

/**
 * Rounds each element in a matrix with a specified precision.
 * @param {Matrix} M Matrix
 * @param {Number} [precision=0] Precision in digits after the comma
 * @returns {Matrix} Matrix with rounded entries.
 */
Matrix.roundTo = function (M, precision) {
    var Result = M.copy(),
        elements = Result.__getElements(),
        precision = precision || 0,
        power = Math.pow( 10, precision );

    for( var i = 0; i < elements.length; i++ ) {
        if( elements[i] ) {
            elements[i] = Math.round( elements[i] * power ) / power;
        }
    }

    Result.__setElements( elements );

    return Result;
}

/**
 * Returns a matrix with the absolute values of each entry of a given matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix N with N(i,j) = abs( M(i,j) ) for all i,j.
 */
Matrix.abs = function (M) {
    var Result = M.copy(),
        elements = Result.__getElements();

    for( var i = 0; i < M.getLength(); i++ ) {
        if( elements[i] ) {
            elements[i] = Math.abs( elements[i] );
        }
    }

    Result.__setElements( elements );

    return Result;
}

/**
 * Returns the cross product of two vectors. It doesn't matter whether the vectors are row or column vectors.
 * The resulting vector will always be a column vector.
 * @param {Matrix} A Three-dimensional vector
 * @param {Matrix} B Three-dimensional vector
 * @returns {Matrix} The three-dimensional vector V = A x B.
 */
Matrix.cross = function (A, B) {
    if( !A.isVector() || !B.isVector() || A.getDominantDimension() !== 3 || B.getDominantDimension() !== 3 ) {
        throw new TypeError( 'Parameters are not three-dimensional vectors.' );
    }

    return new Matrix( [
        [A.get( 2 ) * B.get( 3 ) - A.get( 3 ) * B.get( 2 )],
        [A.get( 3 ) * B.get( 1 ) - A.get( 1 ) * B.get( 3 )],
        [A.get( 1 ) * B.get( 2 ) - A.get( 2 ) * B.get( 1 )]
    ] );
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

    return new Matrix( rows, columns ).__setElements( elements );
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
 * If called with a second parameter k, the k-th diagonal will be filled instead of the main diagonal.
 * @param {Number[]} elements Array of diagonal elements
 * @param {Number} [k=0] Offset specifying the diagonal, i.e. k = 1 is the first upper diagonal
 * @returns {Matrix} Matrix with the specified elements on its diagonal.
 */
Matrix.diag = function (elements, k) {
    k = k || 0;

    var Result = new Matrix( elements.length + Math.abs( k ) ),
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 );

    for( var i = 1; i <= ( Result.dim( 1 ) - Math.abs( k ) ); i++ ) {
        Result.set( i + rowOffset, i + columnOffset, elements[i - 1] );
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

    return new Matrix( rows, columns ).__setElements( elements );
}