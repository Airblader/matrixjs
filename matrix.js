/**
 * matrix.js
 * (C) 2013 Ingo Bürk, admin (at) airblader (dot) de
 * This library is protected with the MIT License.
 *
 * matrix.js is a Javascript library that offers a matrix structure and calculations on matrices,
 * such as adding, multiplying, inverting, ...
 *
 * @author Ingo Bürk
 */

/**
 * Creates a new Matrix.<br />
 * There is a number of different signatures for the parameter(s) to define the matrix.<br />
 *  - Use one number n to create a n-by-n matrix filled with zeros.<br />
 *  - Use two numbers m, n to create a m-by-n matrix filled with zeros.<br />
 *  - Use an array of arrays, wherein the inner arrays represent entire rows.<br />
 *  - Use an array of numbers defining the elements from left to right, top to bottom. If no other argument
 *    is given, the matrix will be assumed to be square. Alternatively, pass two arguments to specify the row and
 *    column dimension of the matrix. If either one is null/undefined, it will be computed from the other one.
 *    @example
 *      new Matrix( 3 );
 *
 *      new Matrix( 2, 3 );
 *
 *      new Matrix( [
 *          [1,2,3],
 *          [4,5,6]
 *      ] );
 *
 *      new Matrix( [1, 2, 3, 4, 5, 6, 7, 8, 9] );
 *      new Matrix( [1, 2, 3, 4, 5, 6], 2, 3 );
 *      new Matrix( [1, 2, 3, 4, 5, 6], 2 );
 *      new Matrix( [1, 2, 3, 4, 5, 6], null, 3 );
 * @constructor
 * @param {...*} var_args
 * @export
 */
function Matrix (var_args) {
    var args = [].slice.call( arguments ),
        __rows, __columns,
        __elements = [];

    /**
     * @private
     * @ignore
     */
    this.___get = function (index) {
        return __elements[index];
    };

    /**
     * @private
     * @ignore
     */
    this.___set = function (index, value) {
        __elements[index] = value;
        return this;
    };

    /**
     * @private
     * @ignore
     */
    this.___dim = function () {
        return {
            rows: __rows,
            columns: __columns
        };
    };

    // Constructor
    (function () {
        if( args.length === 1 && args[0] instanceof Array && args[0].length !== 0 && args[0][0] instanceof Array ) {
            __rows = args[0].length;
            __columns = -1;

            for( var i = 0; i < args[0].length; i++ ) {
                if( (args[0][i].length !== __columns && __columns !== -1) ) {
                    throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS,
                        'Number of columns must be the same for all rows' );
                }
                if( !Matrix.__isNumberArray( args[0][i] ) ) {
                    throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
                }
                __columns = Math.max( __columns, args[0][i].length );

                for( var j = 0; j < args[0][i].length; j++ ) {
                    __elements.push( args[0][i][j] );
                }
            }
        } else if( args.length >= 1 && args.length <= 3 && args[0] instanceof Array
            && ( args[0].length === 0 || Matrix.__isNumber( args[0][0] ) ) ) {

            if( !Matrix.__isNumberArray( args[0] ) ) {
                throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
            }

            __elements = args[0];
            var rows = args[1],
                columns = args[2];

            if( !Matrix.__isNumber( rows ) && !Matrix.__isNumber( columns ) ) {
                var dim = Math.sqrt( __elements.length );

                rows = dim;
                columns = dim;
            } else if( !Matrix.__isNumber( rows ) && Matrix.__isInteger( columns ) ) {
                rows = __elements.length / columns;
            } else if( Matrix.__isInteger( rows ) && !Matrix.__isNumber( columns ) ) {
                columns = __elements.length / rows;
            }

            if( !Matrix.__isInteger( rows ) || !Matrix.__isInteger( columns ) ) {
                throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS,
                    'Array must represent square matrix if no size is given' );
            }

            __rows = rows;
            __columns = columns;
        } else if( args.length === 1 && Matrix.__isInteger( args[0] ) ) {
            __rows = args[0];
            __columns = args[0];
            __elements = Matrix.repeat( __rows * __columns, 0 );
        } else if( args.length === 2 && Matrix.__isInteger( args[0] ) && Matrix.__isInteger( args[1] ) ) {
            __rows = args[0];
            __columns = args[1];
            __elements = Matrix.repeat( __rows * __columns, 0 );
        } else {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS,
                'Parameters must match a supported signature' );
        }
    })();

    return this;
}

/**
 * Define default settings
 * @static
 * @export
 */
Matrix.options = {
    stringify: {
        rowSeparator: '\r\n',
        columnSeparator: '\t'
    },

    isTriangular: {
        mode: 'both'
    },

    roundTo: {
        digits: 0
    },

    norm: {
        which: 'max'
    },

    random: {
        minVal: 0,
        maxVal: 1,
        onlyInteger: true
    }
};

/**
 * Get an entry from the matrix.
 * If the instance this is called on is a vector, the second argument may be omitted and the first one specifies
 * which entry to return.
 * @param {number} row Row index if column is set or linear index
 * @param {number} [column] Column index, can be omitted for vectors
 * @returns {number}
 * @export
 */
Matrix.prototype.get = function (row, column) {
    if( !this.__inRange( row, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.__get( row, column );
};

/**
 * Set an entry in the matrix.
 * Note: This function modifies the instance it is called on.
 * @param {number} row Row index
 * @param {number} column Column index
 * @param {number} value Value to assign
 * @returns {*}
 * @export
 */
Matrix.prototype.set = function (row, column, value) {
    if( !this.__inRange( row, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( !Matrix.__isNumber( value ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Value has to be a number' );
    }

    return this.__set( row, column, value );
};

/**
 * Get a row from the matrix as an array.
 * @param {number} row The row index of the row that shall be returned
 * @param {boolean} [asMatrix=false] If true, the row will be returned as a matrix, otherwise as an array.
 * @returns {Array.<number>|Matrix} Array of the elements in the specified row.
 * @export
 */
Matrix.prototype.getRow = function (row, asMatrix) {
    asMatrix = Matrix._getBooleanOrDefault( asMatrix, false );

    if( !this.__inRange( row, null ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.__getRow( row, asMatrix );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__getRow = function (row, asMatrix) {
    var result = [],
        columns = this.___dim().columns;

    for( var i = 1; i <= columns; i++ ) {
        result.push( this.__get( row, i ) );
    }

    return (asMatrix) ? new Matrix( result, 1 ) : result;
};

/**
 * Replace a row in the matrix with a new one.
 * Note: This function modifies the instance it is called on.
 * @param {number} row The row index of the row to replace
 * @param {(Array.<number>|Matrix)} entries An array or Matrix containing the new entries for the row
 * @returns {*}
 * @export
 */
Matrix.prototype.setRow = function (row, entries) {
    entries = Matrix.__toArray( entries );

    if( !this.__inRange( row, null ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( entries.length !== this.___dim().columns ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of columns in row.' );
    }

    return this.__setRow( row, entries );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__setRow = function (row, entries) {
    var columns = this.___dim().columns;

    for( var i = 1; i <= columns; i++ ) {
        this.__set( row, i, entries[i - 1] );
    }

    return this;
};

/**
 * Get a column from the matrix as an array.
 * @param {number} column The column index of the column that shall be returned
 * @param {boolean} [asMatrix=false] If true, the column will be returned as a matrix, otherwise as an array.
 * @returns {(Array.<number>|Matrix)} Array of the elements in the specified column.
 * @export
 */
Matrix.prototype.getColumn = function (column, asMatrix) {
    asMatrix = Matrix._getBooleanOrDefault( asMatrix, false );

    if( !this.__inRange( null, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.__getColumn( column, asMatrix );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__getColumn = function (column, asMatrix) {
    var result = [],
        rows = this.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        result.push( this.__get( i, column ) );
    }

    return (asMatrix) ? new Matrix( result, null, 1 ) : result;
};

/**
 * Replace a column in the matrix with a new one.
 * Note: This function modifies the instance it is called on.
 * @param {number} column The column index of the column to replace
 * @param {(Array.<number>|Matrix)} entries An array or matrix containing the new entries for the column
 * @returns {*}
 * @export
 */
Matrix.prototype.setColumn = function (column, entries) {
    entries = Matrix.__toArray( entries );

    if( !this.__inRange( null, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( entries.length !== this.___dim().rows ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of rows in column' );
    }

    return this.__setColumn( column, entries );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__setColumn = function (column, entries) {
    var rows = this.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        this.__set( i, column, entries[i - 1] );
    }

    return this;
};

/**
 * Check if the matrix is a vector.
 * @returns {boolean} True if at least one dimension is 1.
 * @export
 */
Matrix.prototype.isVector = function () {
    return this.dim( 'min' ) === 1;
};

/**
 * Check if the matrix is a square matrix.
 * @returns {boolean} True if the number of rows and columns equal, false otherwise.
 * @export
 */
Matrix.prototype.isSquare = function () {
    return this.___dim().rows === this.___dim().columns;
};

/**
 * Check if the matrix is symmetric.
 * @returns {boolean}
 * @export
 */
Matrix.prototype.isSymmetric = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var rows = this.___dim().rows;

    // shifted loop start because the diagonal doesn't need to be checked
    for( var i = 2; i <= rows; i++ ) {
        for( var j = 1; j < i; j++ ) {
            if( this.__get( i, j ) !== this.__get( j, i ) ) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Check if matrix is triangular.
 * @param {string} [mode='both'] What kind of triangular matrix to check for. Possible values are:<br />
 *  - 'lower': True if lower triangular matrix, false otherwise
 *  - 'upper': True if upper triangular matrix, false otherwise
 *  - 'both': True if either lower or upper triangular, false otherwise
 * @returns {boolean}
 * @export
 */
Matrix.prototype.isTriangular = function (mode) {
    mode = Matrix._getStringOrDefault( mode, Matrix.options.isTriangular.mode );

    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    switch( mode.toLowerCase() ) {
        case 'lower':
            return this.__isTriangular( false );
        case 'upper':
            return this.__isTriangular( true );
        case 'both':
            return ( this.__isTriangular( true ) || this.__isTriangular( false ) );
        default:
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Mode not supported' );
    }
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__isTriangular = function (upper) {
    var sign = (upper) ? 1 : -1,
        diag, num_diag,
        rows = this.___dim().rows;

    for( var i = 1; i < rows; i++ ) {
        diag = this.diag( sign * i );
        num_diag = diag.length;

        for( var j = 0; j < num_diag; j++ ) {
            if( diag[j] !== 0 ) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Return a copy of the matrix. This prevents accidental usage of references.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.copy = function () {
    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Copy = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        Copy.__setRow( i, this.__getRow( i, false ) );
    }

    return Copy;
};

/**
 * Returns the number of elements in the matrix.
 * @returns {number}
 * @export
 */
Matrix.prototype.size = function () {
    return this.___dim().rows * this.___dim().columns;
};

/**
 * Get the dimensions of the matrix.
 * @param {(number|string)} which Define which dimension should be returned. Possible values are:<br />
 *  - 1 or 'rows' : Number of rows<br />
 *  - 2 or 'columns' : Number of columns<br />
 *  - 'max' : Dominant dimension<br />
 *  - 'min' : Smaller dimension
 * @returns {number} Object with the dimensions of requested dimension or just
 * the requested dimension.
 * @export
 */
Matrix.prototype.dim = function (which) {
    var dim = this.___dim();

    switch( which ) {
        case 1:
        case 'rows':
            return dim.rows;
        case 2:
        case 'columns':
            return dim.columns;
        case 'max':
            return Math.max( dim.rows, dim.columns );
        case 'min':
            return Math.min( dim.rows, dim.columns );
        default:
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must match a known value' );
    }
};

/**
 * Add a matrix.
 * If more than one matrix is passed, they will be added in order, i.e. this + M + N + ...
 * @param {Matrix} M Matrix
 * @returns {Matrix} Component-wise sum of this and M.
 * @export
 */
Matrix.prototype.add = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.add.apply( Object( this.add( args.shift() ) ), Object( args ) );
    }

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, this.__get( i, j ) + M.__get( i, j ) );
        }
    }

    return Result;
};

/**
 * Subtract a matrix.
 * If more than one matrix is passed, they wll be subtracted in order, i.e. this - M - N - ...
 * @param {Matrix} M Matrix
 * @returns {Matrix} Component-wise difference of this and M.
 * @export
 */
Matrix.prototype.subtract = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.subtract.apply( Object( this.subtract( args.shift() ) ), Object( args ) );
    }

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, this.__get( i, j ) - M.__get( i, j ) );
        }
    }

    return Result;
};

/**
 * Scale with a constant factor (i.e. calculate k * this)
 * @param {number} k Factor
 * @returns {Matrix} Matrix with all entries multiplied by k.
 * @export
 */
Matrix.prototype.scale = function (k) {
    if( !Matrix.__isNumber( k ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Result = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, k * this.__get( i, j ) );
        }
    }

    return Result;
};

/**
 * Multiply with another matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix this * M.
 * @export
 */
Matrix.prototype.multiply = function (M) {
    var dimOuterLeft = this.___dim().rows,
        dimInner = this.___dim().columns,
        dimOuterRight = M.___dim().columns;

    if( dimInner !== M.___dim().rows ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Inner dimensions must match' );
    }

    var Result = new Matrix( dimOuterLeft, dimOuterRight );
    for( var i = 1; i <= dimOuterLeft; i++ ) {
        for( var j = 1; j <= dimOuterRight; j++ ) {
            var temp = 0;
            for( var k = 1; k <= dimInner; k++ ) {
                temp += this.__get( i, k ) * M.__get( k, j );
            }

            Result.__set( i, j, temp );
        }
    }

    return Result;
};

/**
 * Transpose the matrix, i.e. take the rows as the columns of the resulting matrix.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.transpose = function () {
    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Result = new Matrix( columns, rows );

    for( var i = 1; i <= rows; i++ ) {
        Result.__setColumn( i, this.__getRow( i, false ) );
    }

    return Result;
};

/**
 * Calculate the trace, i.e. the sum of all diagonal entries.
 * @returns {number} Sum of diagonal entries.
 * @export
 */
Matrix.prototype.trace = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var rows = this.___dim().rows,
        trace = 0;

    for( var i = 1; i <= rows; i++ ) {
        trace += this.__get( i, i );
    }

    return trace;
};

/**
 * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
 * diagonal entries will not be stored.
 * @returns {Matrix} Matrix with the LU entries. There is also a hidden property swappedRows with the number
 * of rows that were swapped in the process.
 * @export
 */
Matrix.prototype.decomposeLU = function () {
    var swappedRows = 0,
        LU = this.copy();

    var i, j, k,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    var pivot, maxArg, currArg, tempRow;

    for( k = 1; k <= rows; k++ ) {
        pivot = 0;
        maxArg = -1;

        for( i = k; i <= rows; i++ ) {
            currArg = Math.abs( LU.__get( i, k ) );

            if( currArg >= maxArg ) {
                pivot = i;
                maxArg = currArg;
            }
        }

        if( LU.__get( pivot, k ) === 0 ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.MATRIX_IS_SINGULAR );
        }

        if( pivot !== k ) {
            tempRow = LU.__getRow( pivot, false );

            LU.__setRow( pivot, LU.__getRow( k, false ) );
            LU.__setRow( k, tempRow );

            swappedRows++;
        }

        for( i = k + 1; i <= rows; i++ ) {
            for( j = k + 1; j <= columns; j++ ) {
                LU.__set( i, j, LU.__get( i, j ) - LU.__get( k, j ) * ( LU.__get( i, k ) / LU.__get( k, k ) ) );
            }

            LU.__set( i, k, 0 );
        }
    }

    // as a "hidden property" we attach the number of swapped rows
    LU.swappedRows = swappedRows;

    return LU;
};

/**
 * Calculate the determinant.
 * @returns {number}
 * @export
 */
Matrix.prototype.det = function () {
    var i, det,
        rows = this.___dim().rows;

    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    if( this.isTriangular() ) {
        det = 1;

        for( i = 1; i <= this.___dim().rows; i++ ) {
            det = det * this.__get( i, i );
        }
    } else {
        try {
            var LU = this.decomposeLU();
        } catch( e ) {
            if( e.code && e.code === Matrix.ErrorCodes.MATRIX_IS_SINGULAR ) {
                return 0;
            }

            throw e;
        }

        det = Math.pow( -1, LU.swappedRows );

        for( i = 1; i <= rows; i++ ) {
            det = det * LU.__get( i, i );
        }
    }

    return det;
};

/**
 * Calculate the inverse matrix.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.inverse = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var M = this.augment( Matrix.eye( this.___dim().rows ) ),
        row, i, j, k, factor, rows, columns;

    try {
        M = M.decomposeLU();
        rows = M.___dim().rows;
        columns = M.___dim().columns;

        // TODO The following two loops can probably be rewritten into something smarter
        for( i = rows; i > 1; i-- ) {
            row = M.__getRow( i, false );
            factor = M.__get( i - 1, i ) / M.__get( i, i );

            for( k = 0; k < columns; k++ ) {
                M.__set( i - 1, k + 1, M.__get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( j = 1; j <= rows; j++ ) {
            row = M.__getRow( j, false );

            for( k = 0; k < columns; k++ ) {
                row[k] = row[k] / M.__get( j, j );
            }

            M.__setRow( j, row );
        }
    } catch( e ) {
        // TODO if caching attributes like the determinant is introduced, replace this by checking
        // the determinant and throw a general error here
        throw new Matrix.MatrixError( Matrix.ErrorCodes.MATRIX_IS_SINGULAR );
    }

    return M.submatrix( 1, M.___dim().rows, this.___dim().columns + 1, M.___dim().columns );
};

/**
 * Extract a submatrix.
 * @param {number} rowStart Row index where to start the cut
 * @param {number} rowEnd Row index where to end the cut
 * @param {number} columnStart Column index where to start the cut
 * @param {number} columnEnd Column index where to end the cut
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.submatrix = function (rowStart, rowEnd, columnStart, columnEnd) {
    if( !this.__inRange( rowStart, columnStart ) || !this.__inRange( rowEnd, columnEnd )
        || rowStart > rowEnd || columnStart > columnEnd ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    var mResult = rowEnd - rowStart + 1,
        nResult = columnEnd - columnStart + 1;

    var Result = new Matrix( mResult, nResult );
    for( var i = rowStart; i <= rowEnd; i++ ) {
        Result.__setRow( i - rowStart + 1, this.__getRow( i, false ).slice( columnStart - 1, columnEnd ) );
    }

    return Result;
};

/**
 * Augment with another matrix.
 * @param {Matrix} B Matrix
 * @returns {Matrix} Augmented matrix this|B.
 * @export
 */
Matrix.prototype.augment = function (B) {
    var columns = this.___dim().columns,
        columnsB = B.___dim().columns;

    if( this.___dim().rows !== B.___dim().rows ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Number of rows must match' );
    }

    var Result = new Matrix( this.___dim().rows, columns + columnsB );

    for( var i = 1; i <= columns; i++ ) {
        Result.__setColumn( i, this.__getColumn( i, false ) );
    }
    for( var j = 1; j <= columnsB; j++ ) {
        Result.__setColumn( j + this.___dim().columns, B.__getColumn( j, false ) );
    }

    return Result;
};

/**
 * Calculate the dot product. Both vectors have to be column vectors.
 * @param {Matrix} M Matrix
 * @returns {number} Euclidean dot product of this and M.
 * @export
 */
Matrix.prototype.dot = function (M) {
    var rows = this.___dim().rows;

    if( !this.isVector() || !M.isVector() || this.___dim().columns !== 1 || M.___dim().columns !== 1 ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a column vector' );
    }

    if( rows !== M.___dim().rows ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH );
    }

    var result = 0;
    for( var i = 1; i <= rows; i++ ) {
        result += this.__get( i, 1 ) * M.__get( i, 1 );
    }

    return result;
};

/**
 * Rounds each element to the nearest integer.
 * @see Matrix.prototype.roundTo
 * @export
 */
Matrix.prototype.round = function () {
    return this.roundTo( 0 );
};

/**
 * Rounds each element to a given number of digits.
 * @param {number} [digits=0] Precision in digits after the comma
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.roundTo = function (digits) {
    digits = Matrix._getNumberOrDefault( digits, Matrix.options.roundTo.digits );

    var Result = this.copy(),
        power = Math.pow( 10, digits ),
        rows = Result.___dim().rows,
        columns = Result.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, Math.round( Result.__get( i, j ) * power ) / power );
        }
    }

    return Result;
};

/**
 * Pointwise absolute value of the matrix.
 * @returns {Matrix} Matrix M with M(i,j) = abs( this(i,j) ) for all i,j.
 * @export
 */
Matrix.prototype.abs = function () {
    var Result = this.copy(),
        rows = Result.___dim().rows,
        columns = Result.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, Math.abs( Result.__get( i, j ) ) );
        }
    }

    return Result;
};

/**
 * Returns the cross product. Both vectors have to be column vectors. The resulting vector will also be a column vector.
 * @param {Matrix} M Three-dimensional vector
 * @returns {Matrix} The three-dimensional vector V = A x M.
 * @export
 */
Matrix.prototype.cross = function (M) {
    if( !this.isVector() || !M.isVector() || this.___dim().rows !== 3 || M.___dim().rows !== 3 ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS,
            'Parameters must be three-dimensional column vectors' );
    }

    return new Matrix( [
        [this.__get( 2, 1 ) * M.__get( 3, 1 ) - this.__get( 3, 1 ) * M.__get( 2, 1 )],
        [this.__get( 3, 1 ) * M.__get( 1, 1 ) - this.__get( 1, 1 ) * M.__get( 3, 1 )],
        [this.__get( 1, 1 ) * M.__get( 2, 1 ) - this.__get( 2, 1 ) * M.__get( 1, 1 )]
    ] );
};

/**
 * Add a row to the matrix.
 * @param {(Array.<number>|Matrix)} row Array or matrix of entries to add
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.addRow = function (row) {
    row = Matrix.__toArray( row );
    var rows = this.___dim().rows;

    var Result = new Matrix( rows + 1, this.___dim().columns );

    for( var i = 1; i <= rows; i++ ) {
        Result.__setRow( i, this.__getRow( i, false ) );
    }

    Result.__setRow( rows + 1, row );
    return Result;
};

/**
 * Add a column to the matrix.
 * @param {(Array.<number>|Matrix)} column Array or matrix of entries to add
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.addColumn = function (column) {
    return this.copy().augment( new Matrix( Matrix.__toArray( column ), null, 1 ) );
};

/**
 * Check if the matrix contains a certain value.
 * @param {number} needle Value to look for
 * @param {number} [precision=0] Match if any value is in [needle-precision, needle+precision]
 * @returns {boolean}
 * @export
 */
Matrix.prototype.contains = function (needle, precision) {
    precision = Matrix._getNumberOrDefault( precision, 0 );
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( !Matrix.__isNumber( needle ) || !Matrix.__isNumber( precision ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            if( precision === 0 ) {
                if( this.__get( i, j ) === needle ) {
                    return true;
                }
            } else {
                if( Math.abs( this.__get( i, j ) - needle ) <= precision ) {
                    return true;
                }
            }
        }
    }

    return false;
};

/**
 * Create a string representation of the matrix.
 * @param {string} [rowSeparator=Matrix.options.stringify.rowSeparator] Delimiter between columns
 * @param {string} [columnSeparator=Matrix.options.stringify.columnSeparator] Delimiter between the last column of the
 * previous and first column of the next row
 * @returns {string}
 * @export
 */
Matrix.prototype.stringify = function (rowSeparator, columnSeparator) {
    rowSeparator = Matrix._getStringOrDefault( rowSeparator, Matrix.options.stringify.rowSeparator );
    columnSeparator = Matrix._getStringOrDefault( columnSeparator, Matrix.options.stringify.columnSeparator );

    var outputRows = [],
        current,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        current = [];

        for( var j = 1; j <= columns; j++ ) {
            current.push( this.__get( i, j ) );
        }

        outputRows.push( current.join( columnSeparator ) );
    }

    return outputRows.join( rowSeparator );
};

/**
 * Compare with another matrix.
 * @param {Matrix} M Matrix
 * @returns {boolean} True if A = M, false otherwise.
 * @export
 */
Matrix.prototype.equals = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        return false;
    }

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            if( this.__get( i, j ) !== M.__get( i, j ) ) {
                return false;
            }
        }
    }

    return true;
};

/**
 * Apply a custom function to each entry.
 * @param {function(number, number, number): number} applicator Function to apply. It will be provided with three
 * arguments (value, row index, column index) and has to return the new value to write in the matrix. Predefined
 * applicators can be found at {@link Matrix.applicators}.
 * @param {?function(number, number, number): boolean} [filter=Matrix.filters.all] A function that will be called with
 * the same arguments as applicator. If provided, applicator will only be applied if filter evaluates to true.
 * Predefined filters can be found at {@link Matrix.filters}.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.fun = function (applicator, filter) {
    filter = filter || Matrix.filters.all;

    if( typeof applicator !== 'function' ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Applicator must be a function' );
    }

    if( typeof filter !== 'function' ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Filter must be a function' );
    }

    var Result = this.copy(),
        current,
        rows = Result.___dim().rows,
        columns = Result.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            current = Result.__get( i, j );

            if( filter( current, i, j ) ) {
                Result.__set( i, j, applicator( current, i, j ) );
            }
        }
    }

    return Result;
};

/**
 * Apply a custom function to each non-zero entry.
 * @param {function(number, number, number): number} applicator Function to apply. It will be provided with three
 * arguments (value, row index, column index) and has to return the new value to write in the matrix. Predefined
 * applicators can be found at {@link Matrix.applicators}.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.spfun = function (applicator) {
    return this.fun( applicator, Matrix.filters.nonZero );
};

/**
 * Apply the exponential function point-wise.
 * @returns {Matrix}
 * @export
 */
Matrix.prototype.pw_exp = function () {
    return this.fun( Matrix.applicators.exp, null );
};

/**
 * Raise to the n-th power point-wise.
 * @param {number} n Power
 * @returns {Matrix} The matrix M^n.
 * @export
 */
Matrix.prototype.pw_pow = function (n) {
    return this.fun( function (value) {
        return Math.pow( value, n );
    }, null );
};

/**
 * Calculate the norm.
 * @param {string} [which='max'] Which norm to compute. Possible values are:<br />
 *  - 'p' or 'pnorm': Entry-wise p-norm. The args parameter is required and has to specify p.
 *  - 'frobenius': Frobenius norm, a.k.a. the 2-norm.
 *  - 'rows' or 'rowsum': Row-sum norm.
 *  - 'columns' or 'columnsum': Column-sum norm.
 *  - 'max': Maximum norm.
 * @param {(Object|Number)} [args] Additional parameters a norm may need, e.g. the parameter p for p-norms
 * @returns {number}
 * @export
 */
Matrix.prototype.norm = function (which, args) {
    which = Matrix._getStringOrDefault( which, Matrix.options.norm.which );
    args = args || {};

    switch( which.toLowerCase() ) {
        case 'p':
        case 'pnorm':
            return this.pnorm( Number( args ) );
        case 'frobenius':
            return this.pnorm( 2 );
        case 'rows':
        case 'rowsum':
            return this.rownorm();
        case 'columns':
        case 'columnsum':
            return this.columnnorm();
        case 'max':
            return this.maxnorm();
        default:
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Norm not supported' );
    }
};

/**
 * Calculate the p-norm.
 * @param {number} p
 * @returns {number}
 * @export
 */
Matrix.prototype.pnorm = function (p) {
    if( !Matrix.__isInteger( p ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be an integer' );
    }

    var norm = 0,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            norm += Math.pow( Math.abs( this.__get( i, j ) ), p );
        }
    }

    return Math.pow( norm, 1 / p );
};

/**
 * Calculate the maximum norm.
 * @returns {number}
 * @export
 */
Matrix.prototype.maxnorm = function () {
    var norm = 0,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            norm = Math.max( norm, Math.abs( this.__get( i, j ) ) );
        }
    }

    return norm;
};

/**
 * Calculate the row-sum norm.
 * @returns {number}
 * @export
 */
Matrix.prototype.rownorm = function () {
    var norm = 0,
        rows = this.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        norm = Math.max( norm, this.__getRow( i, true ).pnorm( 1 ) );
    }

    return norm;
};

/**
 * Calculate the column-sum norm.
 * @returns {number}
 * @export
 */
Matrix.prototype.columnnorm = function () {
    var norm = 0,
        columns = this.___dim().columns;

    for( var i = 1; i <= columns; i++ ) {
        norm = Math.max( norm, this.__getColumn( i, true ).pnorm( 1 ) );
    }

    return norm;
};

/**
 * Get the diagonal of the matrix.
 * @param {number} [k=0] Specified which diagonal to return, i.e. 1 for the first upper secondary diagonal.
 * @returns {Array.<number>}
 * @export
 */
Matrix.prototype.diag = function (k) {
    k = Matrix._getNumberOrDefault( k, 0 );

    var diag = [],
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 ),
        endOfLoop = (rowOffset === 0 ) ? (this.___dim().columns - columnOffset) : (this.___dim().rows - rowOffset);

    if( endOfLoop <= 0 ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    for( var i = 1; i <= endOfLoop; i++ ) {
        diag.push( this.__get( i + rowOffset, i + columnOffset ) );
    }

    return diag;
};

/**
 * Convert array to matrix.
 * This method simply calls the {@link Matrix} constructor.
 * @param {number} [rows] Number of rows
 * @param {number} [columns] Number of columns
 * @returns {Matrix}
 * @export
 */
Array.prototype.toMatrix = function (rows, columns) {
    return new Matrix( this, rows, columns );
};

/**
 * Convert array to vector.
 * @param {boolean} [isRowVector=false] If set to true, the vector will be a row vector, otherwise it will be a
 * column vector
 * @returns {Matrix}
 * @export
 */
Array.prototype.toVector = function (isRowVector) {
    isRowVector = Matrix._getBooleanOrDefault( isRowVector, false );

    return new Matrix( this, (isRowVector) ? 1 : this.length, (isRowVector) ? this.length : 1 );
};

/**
 * Convert string to matrix.
 * @param {string} [rowSeparator='\r\n'] Row separator
 * @param {string} [columnSeparator='\t'] Column separator
 * @returns {Matrix}
 * @export
 */
String.prototype.toMatrix = function (rowSeparator, columnSeparator) {
    rowSeparator = Matrix._getStringOrDefault( rowSeparator, '\r\n' );
    columnSeparator = Matrix._getStringOrDefault( columnSeparator, '\t' );

    var rows = this.split( rowSeparator ),
        columns,
        numColumns = 0,
        Result = new Matrix( 0 );

    for( var i = 0; i < rows.length; i++ ) {
        columns = rows[i].split( columnSeparator );
        if( numColumns === 0 ) {
            numColumns = columns.length;
            Result = new Matrix( rows.length, numColumns );
        }

        if( columns.length !== numColumns ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Number of columns is inconsistent' );
        }

        for( var j = 1; j <= numColumns; j++ ) {
            Result.__set( i + 1, j, Number( columns[j - 1] ) );
        }
    }

    return Result;
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__get = function (row, column) {
    return this.___get( this.__convertToIndex( row, column ) );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__set = function (row, column, value) {
    return this.___set( this.__convertToIndex( row, column ), value );
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__convertToIndex = function (row, column) {
    return this.___dim().columns * (row - 1) + column - 1;
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__inRange = function (row, column) {
    return (!Matrix.__isNumber( row ) || ( row >= 1 && row <= this.___dim().rows ) )
        && (!Matrix.__isNumber( column ) || ( column >= 1 && column <= this.___dim().columns ) );
};


/**
 * @static
 * @private
 * @ignore
 */
Matrix.__isNumber = function (k) {
    return typeof k === 'number';
};

/**
 * @static
 * @private
 * @ignore
 */
Matrix.__isInteger = function (k) {
    return Matrix.__isNumber( k ) && (k | 0) === k;
};

/**
 * @static
 * @private
 * @ignore
 */
Matrix.__isMatrix = function (obj) {
    return obj instanceof Matrix;
};

/**
 * @static
 * @private
 * @ignore
 */
Matrix.__isNumberArray = function (obj) {
    for( var i = 0; i < obj.length; i++ ) {
        if( !Matrix.__isNumber( obj[i] ) ) {
            return false;
        }
    }

    return true;
};

/**
 * @param {(Matrix|Array.<number>)} obj
 * @static
 * @private
 * @ignore
 */
Matrix.__toArray = function (obj) {
    if( !Matrix.__isMatrix( obj ) ) {
        return obj;
    }

    if( !obj.isVector() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Argument has to be vector' );
    }

    var temp_obj = obj.copy();
    if( obj.dim( 'max' ) !== obj.___dim().rows ) {
        temp_obj = temp_obj.transpose();
    }

    var result = [],
        rows = temp_obj.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        result.push( temp_obj.__get( i, 1 ) );
    }

    return result;
};

/**
 * @static
 * @protected
 * @ignore
 */
Matrix._getNumberOrDefault = function (obj, defaultValue) {
    return (Matrix.__isNumber( obj )) ? obj : defaultValue;
};

/**
 * @static
 * @protected
 * @ignore
 */
Matrix._getStringOrDefault = function (obj, defaultValue) {
    return (typeof obj === 'string') ? obj : defaultValue;
};

/**
 * @static
 * @protected
 * @ignore
 */
Matrix._getBooleanOrDefault = function (obj, defaultValue) {
    return (typeof obj === 'boolean') ? obj : defaultValue;
};

/**
 * Error thrown by matrixjs.
 * @param {string} code Error code, one of {@link Matrix.ErrorCodes}
 * @param {string} [msg] Additional message string
 * @constructor
 * @export
 */
Matrix.MatrixError = function (code, msg) {
    this.name = 'MatrixError';
    this.code = code;
    this.message = msg;

    this.toString = function () {
        return this.name + ' [' + this.code + ']: ' + (this.message || 'No message');
    }
};

/**
 * @export
 */
Matrix.ErrorCodes = {
    /** @expose */ INVALID_PARAMETERS: 'Invalid parameters',
    /** @expose */ OUT_OF_BOUNDS: 'Out of bounds',
    /** @expose */ DIMENSION_MISMATCH: 'Dimension mismatch',
    /** @expose */ MATRIX_IS_SINGULAR: 'Matrix is singular'
};

/**
 * Predefined filters that can be used with methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 * @static
 * @export
 */
Matrix.filters = {
    /** @expose */
    all: function () {
        return true;
    },

    /** @expose */
    nonZero: function (value) {
        return value !== 0;
    },

    /** @expose */
    diag: function (value, i, j) {
        return i === j;
    }
};

/**
 * Predefined functions that can be used for methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 * @static
 * @export
 */
Matrix.applicators = {
    /** @expose */
    exp: function (value) {
        return Math.exp( value );
    },

    /** @expose */
    square: function (value) {
        return value * value;
    }
};

/**
 * Returns a matrix of zeros.
 * If called with only one argument n, it will return a n-by-n matrix with zeros.
 * @param {number} rows Number of rows
 * @param {number} [columns=rows] Number of columns (defaults to the value of rows)
 * @returns {Matrix} A new matrix of the specified size containing zeros everywhere.
 * @static
 * @export
 */
Matrix.zeros = function (rows, columns) {
    columns = Matrix._getNumberOrDefault( columns, rows );

    return new Matrix( rows, columns );
};

/**
 * Returns a matrix of ones.
 * @param {number} rows Number of rows
 * @param {number} [columns=rows] Number of columns
 * @returns {Matrix} A new matrix of the specified size containing ones everywhere.
 * @static
 * @export
 */
Matrix.ones = function (rows, columns) {
    columns = Matrix._getNumberOrDefault( columns, rows );
    var Result = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.__set( i, j, 1 );
        }
    }

    return Result;
};

/**
 * Returns an identity matrix.
 * @param {number} n Size of the matrix
 * @returns {Matrix} A new n-by-n identity matrix.
 * @static
 * @export
 */
Matrix.eye = function (n) {
    var Result = new Matrix( n, n );
    for( var i = 1; i <= n; i++ ) {
        Result.__set( i, i, 1 );
    }

    return Result;
};

/**
 * Returns a diagonal matrix.
 * If called with a second parameter k, the k-th diagonal will be filled instead of the main diagonal.
 * @param {(Array.<number>|Matrix)} entries Array or matrix of diagonal entries
 * @param {number} [k=0] Offset specifying the diagonal, i.e. k = 1 is the first upper diagonal
 * @returns {Matrix} Matrix with the specified entries on its diagonal.
 * @static
 * @export
 */
Matrix.diag = function (entries, k) {
    entries = Matrix.__toArray( entries );
    k = Matrix._getNumberOrDefault( k, 0 );

    var Result = new Matrix( entries.length + Math.abs( k ) ),
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 ),
        endOfLoop = ( Result.___dim().rows - Math.abs( k ) );

    for( var i = 1; i <= endOfLoop; i++ ) {
        Result.__set( i + rowOffset, i + columnOffset, entries[i - 1] );
    }

    return Result;
};

/**
 * Returns a random matrix.
 * @param {number} rows Number of rows
 * @param {number} [columns=rows] Number of columns
 * @param {number} [minVal=0] Smallest possible value for entries
 * @param {number} [maxVal=1] Biggest possible value for entries
 * @param {boolean} [onlyInteger=true] If true, all entries will be integers
 * @returns {Matrix}
 * @static
 * @export
 */
Matrix.random = function (rows, columns, minVal, maxVal, onlyInteger) {
    columns = Matrix._getNumberOrDefault( columns, rows );
    minVal = Matrix._getNumberOrDefault( minVal, Matrix.options.random.minVal );
    maxVal = Matrix._getNumberOrDefault( maxVal, Matrix.options.random.maxVal );
    onlyInteger = Matrix._getBooleanOrDefault( onlyInteger, Matrix.options.random.onlyInteger );

    var Result = new Matrix( rows, columns ),
        factor = ( maxVal - minVal ) + ( (onlyInteger) ? 1 : 0 ),
        current;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            current = minVal + ( Math.random() * factor );
            if( onlyInteger ) {
                current = current | 0;
            }

            Result.__set( i, j, current );
        }
    }

    return Result;
};

/**
 * Generate an array with linearly increasing numbers
 * @param {number} start Number to start with
 * @param {number} end Number to end with
 * @param {number} [step=1] Step in between numbers
 * @returns {Array.<number>}
 * @static
 * @export
 */
Matrix.linspace = function (start, end, step) {
    step = Matrix._getNumberOrDefault( step, 1 );
    var result = [];

    for( var i = start; i <= end; i += step ) {
        result.push( i );
    }

    return result;
};

/**
 * Generate an array with a repeated constant value.
 * @param {number} times Number of times to repeat
 * @param {number} value Constant value to repeat
 * @returns {Array}
 * @export
 */
Matrix.repeat = function (times, value) {
    var result = [];
    for( var i = 1; i <= times; i++ ) {
        result[i - 1] = value;
    }

    return result;
};