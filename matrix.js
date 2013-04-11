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
 */
function Matrix () {
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
            && ( args[0].length === 0 || (args[0].length !== 0 && Matrix.__isNumber( args[0][0] ) ) ) ) {

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
 * Get an element from the matrix.
 * If called with both arguments, the entry (row, column) will be returned. If called with only one argument,
 * that argument will be mapped linearly (left to right, top to bottom).
 * @param {Number} row Row index if column is set or linear index
 * @param {Number} [column] Column index
 * @returns {Number}
 */
Matrix.prototype.get = function (row, column) {
    if( !Matrix.__isNumber( column ) ) {
        var index = arguments[0];

        if( index < 1 || index > this.size() ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
        }

        return this.___get( index - 1 );
    } else {
        if( !this.__inRange( row, column ) ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
        }

        return this.__get( row, column );
    }
};

/**
 * Set an element in the matrix.
 * If called with all three arguments, the entry (row, column) will be set to value. If called with only two
 * arguments, the first argument will be mapped linearly (left to right, top to bottom) and then be set
 * to value.
 * @param {Number} row Row index of column is set or linear index
 * @param {Number} [column] Column index
 * @param {Number} value Value to assign
 * @returns {*}
 */
Matrix.prototype.set = function (row, column, value) {
    var index;

    if( !Matrix.__isNumber( value ) ) {
        index = row - 1;
        value = column;

        if( index < 0 || index >= this.size() ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
        }

        this.___set( index, value );
    } else {
        if( !this.__inRange( row, column ) ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
        }

        this.__set( row, column, value );
    }

    return this;
};

/**
 * Get a row from the matrix as an array.
 * @param {Number} row The row index of the row that shall be returned
 * @param {Boolean} [asMatrix=false] If true, the row will be returned as a matrix, otherwise as an array.
 * @returns {Number[]|Matrix} Array of the elements in the specified row.
 */
Matrix.prototype.getRow = function (row, asMatrix) {
    asMatrix = Matrix._getBooleanOrDefault( asMatrix, false );

    if( !this.__inRange( row, null ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    var result = [];
    for( var i = 1; i <= this.dim( 2 ); i++ ) {
        result.push( this.get( row, i ) );
    }

    return (asMatrix) ? new Matrix( result, 1 ) : result;
};

/**
 * Replace a row in the matrix with a new one.
 * @param {Number} row The row index of the row to replace
 * @param {Number[]|Matrix} elements An array or Matrix containing the new entries for the row
 * @returns {*}
 */
Matrix.prototype.setRow = function (row, elements) {
    elements = Matrix.__getArrayOrElements( elements );

    if( !this.__inRange( row, null ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( elements.length !== this.dim( 2 ) ) {
        throw new Matrix.MatrixError( 'Wrong number of columns in row.' );
    }

    for( var i = 1; i <= this.dim( 2 ); i++ ) {
        this.set( row, i, elements[i - 1] );
    }

    return this;
};

/**
 * Get a column from the matrix as an array.
 * @param {Number} column The column index of the column that shall be returned
 * @param {Boolean} [asMatrix=false] If true, the column will be returned as a matrix, otherwise as an array.
 * @returns {Number[]|Matrix} Array of the elements in the specified column.
 */
Matrix.prototype.getColumn = function (column, asMatrix) {
    asMatrix = Matrix._getBooleanOrDefault( asMatrix, false );

    if( !this.__inRange( null, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    var result = [];
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        result.push( this.__get( i, column ) );
    }

    return (asMatrix) ? new Matrix( result, null, 1 ) : result;
};

/**
 * Replace a column in the matrix with a new one.
 * @param {Number} column The column index of the column to replace
 * @param {Number[]|Matrix} elements An array or matrix containing the new entries for the column
 * @returns {*}
 */
Matrix.prototype.setColumn = function (column, elements) {
    elements = Matrix.__getArrayOrElements( elements );

    if( !this.__inRange( null, column ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( elements.length !== this.dim( 1 ) ) {
        throw new Matrix.MatrixError( 'Wrong number of rows in column' );
    }

    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        this.__set( i, column, elements[i - 1] );
    }

    return this;
};

/**
 * Check if the matrix is a vector.
 * @returns {Boolean} True if at least one dimension is 1.
 */
Matrix.prototype.isVector = function () {
    return this.dim( 'min' ) === 1;
};

/**
 * Check if the matrix is a square matrix.
 * @returns {Boolean} True if the number of rows and columns equal, false otherwise.
 */
Matrix.prototype.isSquare = function () {
    return this.dim( 1 ) === this.dim( 2 );
};

/**
 * Check if the matrix is symmetric.
 * @returns {Boolean}
 */
Matrix.prototype.isSymmetric = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    for( var i = 2; i <= this.dim( 1 ); i++ ) {
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
 * @param {String} [mode='both'] What kind of triangular matrix to check for. Possible values are:<br />
 *  - 'lower': True if lower triangular matrix, false otherwise
 *  - 'upper': True if upper triangular matrix, false otherwise
 *  - 'both': True if either lower or upper triangular, false otherwise
 * @returns {Boolean}
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
        diag;

    for( var i = 1; i < this.dim( 1 ); i++ ) {
        diag = this.diag( sign * i );

        for( var j = 0; j < diag.length; j++ ) {
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
 */
Matrix.prototype.copy = function () {
    var Copy = new Matrix( this.dim( 1 ), this.dim( 2 ) );
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        Copy.setRow( i, this.getRow( i ) );
    }

    return Copy;
};

/**
 * Returns the number of elements in the matrix.
 * @returns {number}
 */
Matrix.prototype.size = function () {
    return this.dim( 1 ) * this.dim( 2 );
};

/**
 * Get the dimensions of the matrix.
 * @param {Number|String} [which] Define which dimension should be returned. If this parameter is not given,
 * an object with a 'rows' and 'columns' property is returned. Other possible values are:<br />
 *  - 1 or 'rows' : Number of rows<br />
 *  - 2 or 'columns' : Number of columns<br />
 *  - 'max' : Dominant dimension<br />
 *  - 'min' : Smaller dimension
 * @returns {{rows: Number, columns: Number}|Number} Object with the dimensions of requested dimension or just
 * the requested dimension.
 */
Matrix.prototype.dim = function (which) {
    var dim = this.___dim();

    switch( which ) {
        case undefined:
            return dim;
            break;
        case 1:
        case 'rows':
            return dim.rows;
            break;
        case 2:
        case 'columns':
            return dim.columns;
            break;
        case 'max':
            return Math.max( dim.rows, dim.columns );
            break;
        case 'min':
            return Math.min( dim.rows, dim.columns );
            break;
        default:
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must match a known value' );
    }
};

/**
 * Add a matrix.
 * If more than one matrix is passed, they will be added in order, i.e. this + M + N + ...
 * @param {Matrix} M Matrix
 * @returns {Matrix} Component-wise sum of this and M.
 */
Matrix.prototype.add = function (M) {
    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.add.apply( Object( this.add( args.shift() ) ), Object( args ) );
    }

    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) );
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        for( var j = 1; j <= this.dim( 2 ); j++ ) {
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
 */
Matrix.prototype.subtract = function (M) {
    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.subtract.apply( Object( this.subtract( args.shift() ) ), Object( args ) );
    }

    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) );
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        for( var j = 1; j <= this.dim( 2 ); j++ ) {
            Result.__set( i, j, this.__get( i, j ) - M.__get( i, j ) );
        }
    }

    return Result;
};

/**
 * Scale with a constant factor (i.e. calculate k * this)
 * @param {Number} k Factor
 * @returns {Matrix} Matrix with all entries multiplied by k.
 */
Matrix.prototype.scale = function (k) {
    if( !Matrix.__isNumber( k ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    var __elements = [];
    for( var i = 0; i < this.size(); i++ ) {
        __elements[i] = k * this.___get( i );
    }

    return new Matrix( __elements, this.dim( 1 ), this.dim( 2 ) );
};

/**
 * Multiply with another matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix this * M.
 */
Matrix.prototype.multiply = function (M) {
    // TODO Idea: Strassen Algorithm for big matrices

    if( this.dim( 2 ) !== M.dim( 1 ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Inner dimensions must match' );
    }

    var Result = new Matrix( this.dim( 1 ), M.dim( 2 ) );
    for( var i = 1; i <= Result.dim( 1 ); i++ ) {
        for( var j = 1; j <= Result.dim( 2 ); j++ ) {
            var temp = 0;
            for( var k = 1; k <= this.dim( 2 ); k++ ) {
                temp += this.get( i, k ) * M.get( k, j );
            }

            Result.__set( i, j, temp );
        }
    }

    return Result;
};

/**
 * Transpose the matrix, i.e. take the rows as the columns of the resulting matrix.
 * @returns {Matrix}
 */
Matrix.prototype.transpose = function () {
    var Result = new Matrix( this.dim( 2 ), this.dim( 1 ) );
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        Result.setColumn( i, this.getRow( i ) );
    }

    return Result;
};

/**
 * Calculate the trace, i.e. the sum of all diagonal entries.
 * @returns {Number} Sum of diagonal entries.
 */
Matrix.prototype.trace = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var trace = 0;
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        trace += this.get( i, i );
    }

    return trace;
};

/**
 * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
 * diagonal entries will not be stored.
 * @returns {Matrix} Matrix with the LU entries. There is also a hidden property swappedRows with the number
 * of rows that were swapped in the process.
 */
Matrix.prototype.LUDecomposition = function () {
    var swappedRows = 0,
        LU = this.copy();

    var i, j, k;

    for( k = 1; k <= this.dim( 1 ); k++ ) {
        var pivot = 0,
            maxArg = -1;

        for( i = k; i <= this.dim( 1 ); i++ ) {
            var currArg = Math.abs( LU.__get( i, k ) );

            if( currArg >= maxArg ) {
                pivot = i;
                maxArg = currArg;
            }
        }

        if( LU.__get( pivot, k ) === 0 ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.MATRIX_IS_SINGULAR );
        }

        if( pivot !== k ) {
            var tempRow = LU.getRow( pivot );

            LU.setRow( pivot, LU.getRow( k ) );
            LU.setRow( k, tempRow );

            swappedRows++;
        }

        for( i = k + 1; i <= this.dim( 1 ); i++ ) {
            for( j = k + 1; j <= this.dim( 2 ); j++ ) {
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
 * @returns {Number}
 */
Matrix.prototype.det = function () {
    var i,
        det;

    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    if( this.isTriangular() ) {
        det = 1;

        for( i = 1; i <= this.dim( 1 ); i++ ) {
            det = det * this.__get( i, i );
        }
    } else {
        try {
            var LU = this.LUDecomposition();
        } catch( e ) {
            if( e.code && e.code === Matrix.ErrorCodes.MATRIX_IS_SINGULAR ) {
                return 0;
            }

            throw e;
        }

        det = Math.pow( -1, LU.swappedRows );

        for( i = 1; i <= this.dim( 1 ); i++ ) {
            det = det * LU.__get( i, i );
        }
    }

    return det;
};

/**
 * Calculate the inverse matrix.
 * @returns {Matrix}
 */
Matrix.prototype.inverse = function () {
    if( !this.isSquare() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var M = this.augment( Matrix.eye( this.dim( 1 ) ) ),
        row, i, j, k;

    try {
        M = M.LUDecomposition();

        // TODO The following two loops can probably be rewritten into something smarter
        for( i = M.dim( 1 ); i > 1; i-- ) {
            row = M.getRow( i );
            var factor = M.__get( i - 1, i ) / M.__get( i, i );

            for( k = 0; k < row.length; k++ ) {
                M.__set( i - 1, k + 1, M.__get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( j = 1; j <= M.dim( 1 ); j++ ) {
            row = M.getRow( j );

            for( k = 0; k < row.length; k++ ) {
                row[k] = row[k] / M.__get( j, j );
            }

            M.setRow( j, row );
        }
    } catch( e ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.MATRIX_IS_SINGULAR );
    }

    return M.submatrix( 1, M.dim( 1 ), this.dim( 2 ) + 1, M.dim( 2 ) );
};

/**
 * Extract a submatrix.
 * @param {Number} rowStart Row index where to start the cut
 * @param {Number} rowEnd Row index where to end the cut
 * @param {Number} columnStart Column index where to start the cut
 * @param {Number} columnEnd Column index where to end the cut
 * @returns {Matrix}
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
        var row = this.getRow( i ).slice( columnStart - 1, columnEnd );
        Result.setRow( i - rowStart + 1, row );
    }

    return Result;
};

/**
 * Augment with another matrix.
 * @param {Matrix} B Matrix
 * @returns {Matrix} Augmented matrix this|B.
 */
Matrix.prototype.augment = function (B) {
    if( this.dim( 1 ) !== B.dim( 1 ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Number of rows must match' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) + B.dim( 2 ) );

    for( var i = 1; i <= this.dim( 2 ); i++ ) {
        Result.setColumn( i, this.getColumn( i ) );
    }
    for( var j = 1; j <= B.dim( 2 ); j++ ) {
        Result.setColumn( j + this.dim( 2 ), B.getColumn( j ) );
    }

    return Result;
};

/**
 * Calculate the dot product. It doesn't matter whether the vectors are row or column vectors.
 * @param {Matrix} M Matrix
 * @returns {Number} Euclidean dot product of this and M.
 */
Matrix.prototype.dot = function (M) {
    if( !this.isVector() || !M.isVector() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a vector' );
    }

    var dimA = this.dim( 'max' ),
        dimB = M.dim( 'max' );

    if( dimA !== dimB ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH );
    }

    var result = 0;
    for( var i = 1; i <= dimA; i++ ) {
        result += this.get( i ) * M.get( i );
    }

    return result;
};

/**
 * Rounds each element to the nearest integer.
 * @see Matrix.prototype.roundTo
 */
Matrix.prototype.round = function () {
    return this.roundTo( 0 );
};

/**
 * Rounds each element to a given number of digits.
 * @param {Number} [digits=0] Precision in digits after the comma
 * @returns {Matrix}
 */
Matrix.prototype.roundTo = function (digits) {
    digits = Matrix._getNumberOrDefault( digits, Matrix.options.roundTo.digits );

    var Result = this.copy(),
        power = Math.pow( 10, digits );

    for( var i = 0; i < Result.size(); i++ ) {
        Result.___set( i, Math.round( Result.___get( i ) * power ) / power );
    }

    return Result;
};

/**
 * Pointwise absolute value of the matrix.
 * @returns {Matrix} Matrix M with M(i,j) = abs( this(i,j) ) for all i,j.
 */
Matrix.prototype.abs = function () {
    var Result = this.copy();

    for( var i = 0; i < this.size(); i++ ) {
        Result.___set( i, Math.abs( Result.___get( i ) ) );
    }

    return Result;
};

/**
 * Returns the cross product. It doesn't matter whether the vectors are row or column vectors.
 * The resulting vector will always be a column vector.
 * @param {Matrix} M Three-dimensional vector
 * @returns {Matrix} The three-dimensional vector V = A x M.
 */
Matrix.prototype.cross = function (M) {
    if( !this.isVector() || !M.isVector() || this.dim( 'max' ) !== 3 || M.dim( 'max' ) !== 3 ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS,
            'Parameters must be three-dimensional vectors' );
    }

    return new Matrix( [
        [this.___get( 1 ) * M.___get( 2 ) - this.___get( 2 ) * M.___get( 1 )],
        [this.___get( 2 ) * M.___get( 0 ) - this.___get( 0 ) * M.___get( 2 )],
        [this.___get( 0 ) * M.___get( 1 ) - this.___get( 1 ) * M.___get( 0 )]
    ] );
};

/**
 * Add a row to the matrix.
 * @param {Number[]|Matrix} row Array or matrix of entries to add
 * @returns {Matrix}
 */
Matrix.prototype.addRow = function (row) {
    row = Matrix.__getArrayOrElements( row );

    var Result = new Matrix( this.dim( 1 ) + 1, this.dim( 2 ) );

    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        Result.setRow( i, this.getRow( i ) );
    }

    Result.setRow( this.dim( 1 ) + 1, row );
    return Result;
};

/**
 * Add a column to the matrix.
 * @param {Number[]|Matrix} elements Array or matrix of entries to add
 * @returns {Matrix}
 */
Matrix.prototype.addColumn = function (elements) {
    return this.copy().augment( new Matrix( Matrix.__getArrayOrElements( elements ), null, 1 ) );
};

/**
 * Check if the matrix contains a certain value.
 * @param {Number} needle Value to look for
 * @param {Number} [precision=0] Match if any value is in [needle-precision, needle+precision]
 * @returns {Boolean}
 */
Matrix.prototype.contains = function (needle, precision) {
    precision = Matrix._getNumberOrDefault( precision, 0 );

    if( !Matrix.__isNumber( needle ) || !Matrix.__isNumber( precision ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        for( var j = 1; j <= this.dim( 2 ); j++ ) {
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
 * @param {String} [rowSeparator=Matrix.options.stringify.rowSeparator] Delimiter between columns
 * @param {String} [columnSeparator=Matrix.options.stringify.columnSeparator] Delimiter between the last column of the
 * previous and first column of the next row
 * @returns {String}
 */
Matrix.prototype.stringify = function (rowSeparator, columnSeparator) {
    rowSeparator = Matrix._getStringOrDefault( rowSeparator, Matrix.options.stringify.rowSeparator );
    columnSeparator = Matrix._getStringOrDefault( columnSeparator, Matrix.options.stringify.columnSeparator );

    var rows = [],
        current;
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        current = [];

        for( var j = 1; j <= this.dim( 2 ); j++ ) {
            current.push( this.__get( i, j ) );
        }

        rows.push( current.join( columnSeparator ) );
    }

    return rows.join( rowSeparator );
};

/**
 * Compare with another matrix.
 * @param {Matrix} M Matrix
 * @returns {boolean} True if A = M, false otherwise.
 */
Matrix.prototype.equals = function (M) {
    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        return false;
    }

    for( var i = 0; i < this.size(); i++ ) {
        if( this.___get( i ) !== M.___get( i ) ) {
            return false;
        }
    }

    return true;
};

/**
 * Apply a custom function to each entry.
 * @param {function} applicator Function to apply. It will be provided with three arguments (value, row index,
 * column index) and has to return the new value to write in the matrix. Predefined applicators can be found at
 * {@link Matrix.applicators}.
 * @param {function} [filter=Matrix.filters.all] A function that will be called with the same arguments as applicator.
 * If provided, applicator will only be applied if filter returns true. Predefined filters can be found at
 * {@link Matrix.filters}.
 * @returns {Matrix}
 */
Matrix.prototype.apply = function (applicator, filter) {
    filter = filter || Matrix.filters.all;

    if( typeof applicator !== 'function' ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Applicator must be a function' );
    }

    if( typeof filter !== 'function' ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Filter must be a function' );
    }

    var Result = this.copy(),
        current;

    for( var i = 1; i <= Result.dim( 1 ); i++ ) {
        for( var j = 1; j <= Result.dim( 2 ); j++ ) {
            current = Result.get( i, j );

            if( filter( current, i, j ) === true ) {
                Result.set( i, j, applicator( current, i, j ) );
            }
        }
    }

    return Result;
};

/**
 * Apply a custom function to each non-zero entry.
 * @param {function} applicator Function to apply. It will be provided with three arguments (value, row index,
 * column index) and has to return the new value to write in the matrix. Predefined applicators can be found at
 * {@link Matrix.applicators}.
 * @returns {Matrix}
 */
Matrix.prototype.nzapply = function (applicator) {
    return this.apply( applicator, Matrix.filters.nonZero );
};

/**
 * Apply the exponential function to each entry.
 * @returns {Matrix}
 */
Matrix.prototype.exp = function () {
    return this.apply( Matrix.applicators.exp );
};

/**
 * Raise to the n-th power.
 * @param {Number} n Power
 * @returns {Matrix} The matrix M^n.
 */
Matrix.prototype.pow = function (n) {
    return this.apply( function (value) {
        return Math.pow( value, n );
    } );
};

/**
 * Calculate the norm.
 * @param {String} [which='max'] Which norm to compute. Possible values are:<br />
 *  - 'p' or 'pnorm': Entry-wise p-norm. The args parameter is required and has to specify p.
 *  - 'frobenius': Frobenius norm, a.k.a. the 2-norm.
 *  - 'rows' or 'rowsum': Row-sum norm.
 *  - 'columns' or 'columnsum': Column-sum norm.
 *  - 'max': Maximum norm.
 * @param {Object|Number} [args] Additional parameters a norm may need, e.g. the parameter p for p-norms
 * @returns {Number}
 */
Matrix.prototype.norm = function (which, args) {
    which = Matrix._getStringOrDefault( which, Matrix.options.norm.which );
    args = args || {};

    switch( which.toLowerCase() ) {
        case 'p':
        case 'pnorm':
            return this.pnorm( args );
        case 'frobenius':
            return this.pnorm( 2 );
        case 'rows':
        case 'rowsum':
            return this.rownorm();
            break;
        case 'columns':
        case 'columnsum':
            return this.columnnorm();
            break;
        case 'max':
            return this.maxnorm();
            break;
        default:
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Norm not supported' );
    }
};

/**
 * Calculate the p-norm.
 * @param {Number} p
 * @returns {Number}
 */
Matrix.prototype.pnorm = function (p) {
    if( !Matrix.__isInteger( p ) ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be an integer' );
    }

    var norm = 0;
    for( var i = 0; i < this.size(); i++ ) {
        norm += Math.pow( Math.abs( this.___get( i ) ), p );
    }

    return Math.pow( norm, 1 / p );
};

/**
 * Calculate the maximum norm.
 * @returns {Number}
 */
Matrix.prototype.maxnorm = function () {
    var norm = 0;
    for( var i = 0; i < this.size(); i++ ) {
        norm = Math.max( norm, Math.abs( this.___get( i ) ) );
    }

    return norm;
};

/**
 * Calculate the row-sum norm.
 * @returns {number}
 */
Matrix.prototype.rownorm = function () {
    var norm = 0;

    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        norm = Math.max( norm, this.getRow( i, true ).pnorm( 1 ) );
    }

    return norm;
};

/**
 * Calculate the column-sum norm.
 * @returns {number}
 */
Matrix.prototype.columnnorm = function () {
    var norm = 0;

    for( var i = 1; i <= this.dim( 2 ); i++ ) {
        norm = Math.max( norm, this.getColumn( i, true ).pnorm( 1 ) );
    }

    return norm;
};

/**
 * Get the diagonal of the matrix.
 * @param {Number} [k=0] Specified which diagonal to return, i.e. 1 for the first upper secondary diagonal.
 * @returns {Number[]}
 */
Matrix.prototype.diag = function (k) {
    k = Matrix._getNumberOrDefault( k, 0 );

    var diag = [],
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 ),
        endOfLoop = (rowOffset === 0 ) ? (this.dim( 2 ) - columnOffset) : (this.dim( 1 ) - rowOffset);

    if( endOfLoop <= 0 ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.OUT_OF_BOUNDS );
    }

    for( var i = 1; i <= endOfLoop; i++ ) {
        diag.push( this.get( i + rowOffset, i + columnOffset ) );
    }

    return diag;
};

/**
 * Convert array to matrix.
 * This method simply calls the {@link Matrix} constructor.
 * @param {Number} [rows] Number of rows
 * @param {Number} [columns] Number of columns
 * @returns {Matrix}
 */
Array.prototype.toMatrix = function (rows, columns) {
    return new Matrix( this, rows, columns );
};

/**
 * Convert array to vector.
 * @param {boolean} [isRowVector=false] If set to true, the vector will be a row vector, otherwise it will be a
 * column vector
 * @returns {Matrix}
 */
Array.prototype.toVector = function (isRowVector) {
    isRowVector = Matrix._getBooleanOrDefault( isRowVector, false );

    return new Matrix( this, (isRowVector) ? 1 : this.length, (isRowVector) ? this.length : 1 );
};

/**
 * Convert string to matrix.
 * @param {String} [rowSeparator='\r\n'] Row separator
 * @param {String} [columnSeparator='\t'] Column separator
 * @returns {Matrix}
 */
String.prototype.toMatrix = function (rowSeparator, columnSeparator) {
    rowSeparator = Matrix._getStringOrDefault( rowSeparator, '\r\n' );
    columnSeparator = Matrix._getStringOrDefault( columnSeparator, '\t' );

    var rows = this.split( rowSeparator ),
        columns,
        numColumns = 0,
        __elements = [];

    for( var i = 0; i < rows.length; i++ ) {
        columns = rows[i].split( columnSeparator );
        numColumns = (numColumns === 0) ? columns.length : numColumns;

        if( columns.length !== numColumns ) {
            throw new Matrix.MatrixError( Matrix.ErrorCodes.INVALID_PARAMETERS, 'Number of columns is inconsistent' );
        }

        for( var j = 0; j < numColumns; j++ ) {
            __elements.push( Number( columns[j] ) );
        }
    }

    return new Matrix( __elements, rows.length, numColumns );
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
    return this.dim( 2 ) * (row - 1) + column - 1;
};

/**
 * @private
 * @ignore
 */
Matrix.prototype.__inRange = function (row, column) {
    return (!Matrix.__isNumber( row ) || ( row >= 1 && row <= this.dim( 1 ) ) )
        && (!Matrix.__isNumber( column ) || ( column >= 1 && column <= this.dim( 2 ) ) );
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
 * @param {Matrix|Number[]} obj
 * @static
 * @private
 * @ignore
 */
Matrix.__getArrayOrElements = function (obj) {
    if( !Matrix.__isMatrix( obj ) ) {
        return obj;
    }

    if( !obj.isVector() ) {
        throw new Matrix.MatrixError( Matrix.ErrorCodes.DIMENSION_MISMATCH, 'Argument has to be vector' );
    }

    if( obj.dim( 'max' ) !== obj.dim( 1 ) ) {
        obj = obj.transpose();
    }

    var result = [];
    for( var i = 1; i <= obj.dim( 1 ); i++ ) {
        result.push( obj.get( i, 1 ) );
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
 * @param {String} code Error code, one of {@link Matrix.ErrorCodes}
 * @param {String} [msg] Additional message string
 * @constructor
 */
Matrix.MatrixError = function (code, msg) {
    this.name = 'MatrixError';
    this.code = code;
    this.message = msg;

    this.toString = function () {
        return this.name + ' [' + this.code + ']: ' + (this.message || 'No message');
    }
};

Matrix.ErrorCodes = {
    INVALID_PARAMETERS: 'Invalid parameters',
    OUT_OF_BOUNDS: 'Out of bounds',
    DIMENSION_MISMATCH: 'Dimension mismatch',
    MATRIX_IS_SINGULAR: 'Matrix is singular'
};

/**
 * Predefined filters that can be used with methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 * @static
 */
Matrix.filters = {
    all: function () {
        return true;
    },

    nonZero: function (value) {
        return value !== 0;
    },

    diag: function (value, i, j) {
        return i === j;
    }
};

/**
 * Predefined functions that can be used for methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 * @static
 */
Matrix.applicators = {
    exp: function (value) {
        return Math.exp( value );
    },

    square: function (value) {
        return value * value;
    }
};

/**
 * Returns a matrix of zeros.
 * If called with only one argument n, it will return a n-by-n matrix with zeros.
 * @param {Number} rows Number of rows
 * @param {Number} [columns=rows] Number of columns (defaults to the value of rows)
 * @returns {Matrix} A new matrix of the specified size containing zeros everywhere.
 * @static
 */
Matrix.zeros = function (rows, columns) {
    columns = Matrix._getNumberOrDefault( columns, rows );

    return new Matrix( rows, columns );
};

/**
 * Returns a matrix of ones.
 * @param {Number} rows Number of rows
 * @param {Number} [columns=rows] Number of columns
 * @returns {Matrix} A new matrix of the specified size containing ones everywhere.
 * @static
 */
Matrix.ones = function (rows, columns) {
    columns = Matrix._getNumberOrDefault( columns, rows );

    var elements = [];
    for( var i = 0; i < rows * columns; i++ ) {
        elements[i] = 1;
    }

    return new Matrix( elements, rows, columns );
};

/**
 * Returns an identity matrix.
 * @param {Number} n Size of the matrix
 * @returns {Matrix} A new n-by-n identity matrix.
 * @static
 */
Matrix.eye = function (n) {
    var Result = new Matrix( n, n );
    for( var i = 1; i <= n; i++ ) {
        Result.set( i, i, 1 );
    }

    return Result;
};

/**
 * Returns a diagonal matrix.
 * If called with a second parameter k, the k-th diagonal will be filled instead of the main diagonal.
 * @param {Number[]|Matrix} elements Array or matrix of diagonal elements
 * @param {Number} [k=0] Offset specifying the diagonal, i.e. k = 1 is the first upper diagonal
 * @returns {Matrix} Matrix with the specified elements on its diagonal.
 * @static
 */
Matrix.diag = function (elements, k) {
    elements = Matrix.__getArrayOrElements( elements );
    k = Matrix._getNumberOrDefault( k, 0 );

    var Result = new Matrix( elements.length + Math.abs( k ) ),
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 );

    for( var i = 1; i <= ( Result.dim( 1 ) - Math.abs( k ) ); i++ ) {
        Result.set( i + rowOffset, i + columnOffset, elements[i - 1] );
    }

    return Result;
};

/**
 * Returns a random matrix.
 * @param {Number} rows Number of rows
 * @param {Number} [columns=rows] Number of columns
 * @param {Number} [minVal=0] Smallest possible value for entries
 * @param {Number} [maxVal=1] Biggest possible value for entries
 * @param {Boolean} [onlyInteger=true] If true, all entries will be integers
 * @returns {Matrix}
 * @static
 */
Matrix.random = function (rows, columns, minVal, maxVal, onlyInteger) {
    columns = Matrix._getNumberOrDefault( columns, rows );
    minVal = Matrix._getNumberOrDefault( minVal, Matrix.options.random.minVal );
    maxVal = Matrix._getNumberOrDefault( maxVal, Matrix.options.random.maxVal );
    onlyInteger = Matrix._getBooleanOrDefault( onlyInteger, Matrix.options.random.onlyInteger );

    var Result = new Matrix( rows, columns ),
        factor = ( maxVal - minVal ) + ( (onlyInteger) ? 1 : 0 ),
        current;

    for( var i = 1; i <= Result.size(); i++ ) {
        current = minVal + ( Math.random() * factor );
        if( onlyInteger ) {
            current = current | 0;
        }

        Result.set( i, current );
    }

    return Result;
};

/**
 * Generate an array with linearly increasing numbers
 * @param {Number} start Number to start with
 * @param {Number} end Number to end with
 * @param {Number} [step=1] Step in between numbers
 * @returns {Number[]}
 * @static
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
 * @param {Number} times Number of times to repeat
 * @param {Number} value Constant value to repeat
 * @returns {Array}
 */
Matrix.repeat = function (times, value) {
    var result = [];
    for( var i = 1; i <= times; i++ ) {
        result[i - 1] = value;
    }

    return result;
};