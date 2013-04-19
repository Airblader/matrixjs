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
 * General interface for matrix-like objects.
 * @param var_args
 * @interface
 */
function IMatrix (var_args) {
    this.___get = function (row, column) {
    };

    this.___set = function (row, column, value) {
    };

    this.___dim = function () {

    };
}

/**
 * Base class for matrix-like objects that should be able to communicate with each other.
 * @implements IMatrix
 * @constructor
 * @export
 */
function MatrixCommon () {
    var console = ( window.console && window.console.log ) || {
        log: function (str) {
            // dummy implementation
        }
    };

    this.___get = function (row, column) {
        console.log( 'Tried to call MatrixCommon::___get(' + row + ', ' + column + ')' );

        return null;
    };

    this.___set = function (row, column, value) {
        console.log( 'Tried to call MatrixCommon::___set(' + row + ', ' + column + ', ' + value + ')' );

        return this;
    };

    this.___dim = function () {
        console.log( 'Tried to call MatrixCommon::___dim()' );

        return {
            rows: -1,
            columns: -1
        };
    };

    throw new Error( 'MatrixCommon cannot be instantiated' );
}

/**
 * Static class for utility functions.
 * @static
 * @constructor
 * @export
 */
function MatrixUtils () {
    throw new Error( 'This cannot be instantiated' );
}

/**
 * Error thrown by matrixjs.
 * @param {string} code Error code, one of {@link MatrixError.ErrorCodes}
 * @param {string} [msg] Additional message string
 * @constructor
 * @export
 */
function MatrixError (code, msg) {
    this.name = 'MatrixError';
    this.code = code;
    this.message = msg;

    /** @override */
    this.toString = function () {
        return this.name + ' [' + this.code + ']: ' + (this.message || 'No message');
    }
}

/**
 * Error codes for MatrixError.
 * @export
 */
MatrixError.ErrorCodes = {
    /** @expose */ INVALID_PARAMETERS: 'Invalid parameters',
    /** @expose */ OUT_OF_BOUNDS: 'Out of bounds',
    /** @expose */ DIMENSION_MISMATCH: 'Dimension mismatch',
    /** @expose */ MATRIX_IS_SINGULAR: 'Matrix is singular',
    /** @expose */ UNKNOWN_TYPE: 'Unknown type'
};

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
 * @implements IMatrix
 * @extends MatrixCommon
 * @param {...*} var_args
 * @export
 */
function Matrix (var_args) {
    var args = [].slice.call( arguments ),
        __rows, __columns,
        __elements = [];

    /**
     * @override
     * @private
     * @ignore
     */
    this.___get = function (row, column) {
        return __elements[__columns * (row - 1) + column - 1];
    };

    /**
     * @override
     * @private
     * @ignore
     */
    this.___set = function (row, column, value) {
        __elements[__columns * (row - 1) + column - 1] = value;
        return this;
    };

    /**
     * @override
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
                    throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS,
                        'Number of columns must be the same for all rows' );
                }
                if( !MatrixUtils.isNumberArray( args[0][i] ) ) {
                    throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
                }
                __columns = Math.max( __columns, args[0][i].length );

                for( var j = 0; j < args[0][i].length; j++ ) {
                    __elements.push( args[0][i][j] );
                }
            }
        } else if( args.length >= 1 && args.length <= 3 && args[0] instanceof Array
            && ( args[0].length === 0 || MatrixUtils.isNumber( args[0][0] ) ) ) {

            if( !MatrixUtils.isNumberArray( args[0] ) ) {
                throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
            }

            __elements = args[0];
            var rows = args[1],
                columns = args[2];

            if( !MatrixUtils.isNumber( rows ) && !MatrixUtils.isNumber( columns ) ) {
                var dim = Math.sqrt( __elements.length );

                rows = dim;
                columns = dim;
            } else if( !MatrixUtils.isNumber( rows ) && MatrixUtils.isInteger( columns ) ) {
                rows = __elements.length / columns;
            } else if( MatrixUtils.isInteger( rows ) && !MatrixUtils.isNumber( columns ) ) {
                columns = __elements.length / rows;
            }

            if( !MatrixUtils.isInteger( rows ) || !MatrixUtils.isInteger( columns ) ) {
                throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS,
                    'Array must represent square matrix if no size is given' );
            }

            __rows = rows;
            __columns = columns;
        } else if( args.length === 1 && MatrixUtils.isInteger( args[0] ) ) {
            __rows = args[0];
            __columns = args[0];
            __elements = MatrixUtils.repeat( __rows * __columns, 0 );
        } else if( args.length === 2 && MatrixUtils.isInteger( args[0] ) && MatrixUtils.isInteger( args[1] ) ) {
            __rows = args[0];
            __columns = args[1];
            __elements = MatrixUtils.repeat( __rows * __columns, 0 );
        } else {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS,
                'Parameters must match a supported signature' );
        }
    })();

    return this;
}

// Let Matrix inherit from MatrixCommon
Matrix.prototype = Object.create( MatrixCommon.prototype );
Matrix.prototype.constructor = Matrix;

/*
 ======================================================================================================================
 =============================================== MatrixCommon =========================================================
 ======================================================================================================================
 */

/**
 * Default settings
 * @static
 * @export
 */
MatrixCommon.options = {
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
 * @param {...*} var_args
 * @returns {MatrixCommon}
 * @private
 */
MatrixCommon.prototype.getInstance = function (var_args) {
    var constructor = this.constructor;
    /**
     * @constructor
     * @extends MatrixCommon
     */
    var TypedMatrix = constructor.bind.apply( Object( constructor ), [constructor].concat( [].slice.call( arguments ) ) );

    return new TypedMatrix();
};

/**
 * Get an entry from the matrix.
 * @param {number} row
 * @param {number} column
 * @returns {number}
 * @export
 */
MatrixCommon.prototype.get = function (row, column) {
    if( !this.isInRange( row, column ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.___get( row, column );
};

/**
 * Set an entry in the matrix.
 * Note: This function modifies the instance it is called on.
 * @param {number} row
 * @param {number} column
 * @param {number} value
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.set = function (row, column, value) {
    if( !this.isInRange( row, column ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( !MatrixUtils.isNumber( value ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Value has to be a number' );
    }

    return this.___set( row, column, value );
};

/**
 * Get a row.
 * @param {number} row The row index of the row that shall be returned
 * @param {boolean} [asMatrix=false] If true, the row will be returned as a matrix, otherwise as an array.
 * @returns {Array.<number>|MatrixCommon} Array of the elements in the specified row.
 * @export
 */
MatrixCommon.prototype.getRow = function (row, asMatrix) {
    asMatrix = MatrixUtils.getBooleanWithDefault( asMatrix, false );

    if( !this.isInRange( row, null ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.__getRow( row, asMatrix );
};

/**
 * @private
 * @ignore
 */
MatrixCommon.prototype.__getRow = function (row, asMatrix) {
    var result = [],
        columns = this.___dim().columns;

    for( var i = 1; i <= columns; i++ ) {
        result.push( this.___get( row, i ) );
    }

    return (asMatrix) ? this.getInstance( result, 1 ) : result;
};

/**
 * Replace a row.
 * Note: This function modifies the instance it is called on.
 * @param {number} row The row index of the row to replace
 * @param {(Array.<number>|MatrixCommon)} entries An array or Matrix containing the new entries for the row
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.setRow = function (row, entries) {
    entries = MatrixUtils.toArray( entries );

    if( !this.isInRange( row, null ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( entries.length !== this.___dim().columns ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of columns in row.' );
    }

    return this.__setRow( row, entries );
};

/**
 * @private
 * @ignore
 */
MatrixCommon.prototype.__setRow = function (row, entries) {
    var columns = this.___dim().columns;

    for( var i = 1; i <= columns; i++ ) {
        this.___set( row, i, entries[i - 1] );
    }

    return this;
};

/**
 * Get a column.
 * @param {number} column The column index of the column that shall be returned
 * @param {boolean} [asMatrix=false] If true, the column will be returned as a matrix, otherwise as an array.
 * @returns {(Array.<number>|MatrixCommon)} Array of the elements in the specified column.
 * @export
 */
MatrixCommon.prototype.getColumn = function (column, asMatrix) {
    asMatrix = MatrixUtils.getBooleanWithDefault( asMatrix, false );

    if( !this.isInRange( null, column ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    return this.__getColumn( column, asMatrix );
};

/**
 * @private
 * @ignore
 */
MatrixCommon.prototype.__getColumn = function (column, asMatrix) {
    var result = [],
        rows = this.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        result.push( this.___get( i, column ) );
    }

    return (asMatrix) ? this.getInstance( result, null, 1 ) : result;
};

/**
 * Replace a column.
 * Note: This function modifies the instance it is called on.
 * @param {number} column The column index of the column to replace
 * @param {(Array.<number>|MatrixCommon)} entries An array or matrix containing the new entries for the column
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.setColumn = function (column, entries) {
    entries = MatrixUtils.toArray( entries );

    if( !this.isInRange( null, column ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    if( entries.length !== this.___dim().rows ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of rows in column' );
    }

    return this.__setColumn( column, entries );
};

/**
 * @private
 * @ignore
 */
MatrixCommon.prototype.__setColumn = function (column, entries) {
    var rows = this.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        this.___set( i, column, entries[i - 1] );
    }

    return this;
};

/**
 * Check if the matrix is a vector.
 * @returns {boolean} True if at least one dimension is 1.
 * @export
 */
MatrixCommon.prototype.isVector = function () {
    return this.dim( 'min' ) === 1;
};

/**
 * Check if the matrix is a square matrix.
 * @returns {boolean} True if the number of rows and columns equal, false otherwise.
 * @export
 */
MatrixCommon.prototype.isSquare = function () {
    return this.___dim().rows === this.___dim().columns;
};

/**
 * Check if the matrix is symmetric.
 * @returns {boolean}
 * @export
 */
MatrixCommon.prototype.isSymmetric = function () {
    if( !this.isSquare() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var rows = this.___dim().rows;

    // shifted loop start because the diagonal doesn't need to be checked
    for( var i = 2; i <= rows; i++ ) {
        for( var j = 1; j < i; j++ ) {
            if( this.___get( i, j ) !== this.___get( j, i ) ) {
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
MatrixCommon.prototype.isTriangular = function (mode) {
    mode = MatrixUtils.getStringWithDefault( mode, MatrixCommon.options.isTriangular.mode );

    if( !this.isSquare() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    switch( mode.toLowerCase() ) {
        case 'lower':
            return this.__isTriangular( false );
        case 'upper':
            return this.__isTriangular( true );
        case 'both':
            return ( this.__isTriangular( true ) || this.__isTriangular( false ) );
        default:
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Mode not supported' );
    }
};

/**
 * @private
 * @ignore
 */
MatrixCommon.prototype.__isTriangular = function (upper) {
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
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.copy = function () {
    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Copy = this.getInstance( rows, columns );

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
MatrixCommon.prototype.size = function () {
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
MatrixCommon.prototype.dim = function (which) {
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
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must match a known value' );
    }
};

/**
 * Add a matrix.
 * If more than one matrix is passed, they will be added in order, i.e. this + M + N + ...
 * @param {MatrixCommon} M Matrix
 * @returns {MatrixCommon} Component-wise sum of this and M.
 * @export
 */
MatrixCommon.prototype.add = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.add.apply( Object( this.add( args.shift() ) ), Object( args ) );
    }

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = this.getInstance( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.___set( i, j, this.___get( i, j ) + M.___get( i, j ) );
        }
    }

    return Result;
};

/**
 * Subtract a matrix.
 * If more than one matrix is passed, they wll be subtracted in order, i.e. this - M - N - ...
 * @param {MatrixCommon} M Matrix
 * @returns {MatrixCommon} Component-wise difference of this and M.
 * @export
 */
MatrixCommon.prototype.subtract = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( arguments.length > 1 ) {
        var args = [].slice.call( arguments );

        return this.subtract.apply( Object( this.subtract( args.shift() ) ), Object( args ) );
    }

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
    }

    var Result = this.getInstance( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.___set( i, j, this.___get( i, j ) - M.___get( i, j ) );
        }
    }

    return Result;
};

/**
 * Scale with a constant factor (i.e. calculate k * this)
 * @param {number} k Factor
 * @returns {MatrixCommon} Matrix with all entries multiplied by k.
 * @export
 */
MatrixCommon.prototype.scale = function (k) {
    if( !MatrixUtils.isNumber( k ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Result = this.getInstance( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.___set( i, j, k * this.___get( i, j ) );
        }
    }

    return Result;
};

/**
 * Multiply with another matrix.
 * @param {MatrixCommon} M
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.multiply = function (M) {
    var dimOuterLeft = this.___dim().rows,
        dimInner = this.___dim().columns,
        dimOuterRight = M.___dim().columns;

    if( dimInner !== M.___dim().rows ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Inner dimensions must match' );
    }

    var Result = this.getInstance( dimOuterLeft, dimOuterRight );
    for( var i = 1; i <= dimOuterLeft; i++ ) {
        for( var j = 1; j <= dimOuterRight; j++ ) {
            var temp = 0;
            for( var k = 1; k <= dimInner; k++ ) {
                temp += this.___get( i, k ) * M.___get( k, j );
            }

            Result.___set( i, j, temp );
        }
    }

    return Result;
};

/**
 * Transpose the matrix, i.e. take the rows as the columns of the resulting matrix.
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.transpose = function () {
    var rows = this.___dim().rows,
        columns = this.___dim().columns,
        Result = this.getInstance( columns, rows );

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
MatrixCommon.prototype.trace = function () {
    if( !this.isSquare() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    var rows = this.___dim().rows,
        trace = 0;

    for( var i = 1; i <= rows; i++ ) {
        trace += this.___get( i, i );
    }

    return trace;
};

/**
 * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
 * diagonal entries will not be stored.
 * @returns {MatrixCommon} Matrix with the LU entries. There is also a hidden property swappedRows with the number
 * of rows that were swapped in the process.
 * @export
 */
MatrixCommon.prototype.decomposeLU = function () {
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
            currArg = Math.abs( LU.___get( i, k ) );

            if( currArg >= maxArg ) {
                pivot = i;
                maxArg = currArg;
            }
        }

        if( LU.___get( pivot, k ) === 0 ) {
            throw new MatrixError( MatrixError.ErrorCodes.MATRIX_IS_SINGULAR );
        }

        if( pivot !== k ) {
            tempRow = LU.__getRow( pivot, false );

            LU.__setRow( pivot, LU.__getRow( k, false ) );
            LU.__setRow( k, tempRow );

            swappedRows++;
        }

        for( i = k + 1; i <= rows; i++ ) {
            for( j = k + 1; j <= columns; j++ ) {
                LU.___set( i, j, LU.___get( i, j ) - LU.___get( k, j ) * ( LU.___get( i, k ) / LU.___get( k, k ) ) );
            }

            LU.___set( i, k, 0 );
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
MatrixCommon.prototype.det = function () {
    var i, det,
        rows = this.___dim().rows;

    if( !this.isSquare() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
    }

    if( this.isTriangular() ) {
        det = 1;

        for( i = 1; i <= this.___dim().rows; i++ ) {
            det = det * this.___get( i, i );
        }
    } else {
        try {
            var LU = this.decomposeLU();
        } catch( e ) {
            if( e.code && e.code === MatrixError.ErrorCodes.MATRIX_IS_SINGULAR ) {
                return 0;
            }

            throw e;
        }

        det = Math.pow( -1, LU.swappedRows );

        for( i = 1; i <= rows; i++ ) {
            det = det * LU.___get( i, i );
        }
    }

    return det;
};

/**
 * Calculate the inverse matrix.
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.inverse = function () {
    if( !this.isSquare() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
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
            factor = M.___get( i - 1, i ) / M.___get( i, i );

            for( k = 0; k < columns; k++ ) {
                M.___set( i - 1, k + 1, M.___get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( j = 1; j <= rows; j++ ) {
            row = M.__getRow( j, false );

            for( k = 0; k < columns; k++ ) {
                row[k] = row[k] / M.___get( j, j );
            }

            M.__setRow( j, row );
        }
    } catch( e ) {
        // TODO if caching attributes like the determinant is introduced, replace this by checking
        // the determinant and throw a general error here
        throw new MatrixError( MatrixError.ErrorCodes.MATRIX_IS_SINGULAR );
    }

    return M.submatrix( 1, M.___dim().rows, this.___dim().columns + 1, M.___dim().columns );
};

/**
 * Extract a submatrix.
 * @param {number} rowStart Row index where to start the cut
 * @param {number} rowEnd Row index where to end the cut
 * @param {number} columnStart Column index where to start the cut
 * @param {number} columnEnd Column index where to end the cut
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.submatrix = function (rowStart, rowEnd, columnStart, columnEnd) {
    if( !this.isInRange( rowStart, columnStart ) || !this.isInRange( rowEnd, columnEnd )
        || rowStart > rowEnd || columnStart > columnEnd ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    var mResult = rowEnd - rowStart + 1,
        nResult = columnEnd - columnStart + 1;

    var Result = this.getInstance( mResult, nResult );
    for( var i = rowStart; i <= rowEnd; i++ ) {
        Result.__setRow( i - rowStart + 1, this.__getRow( i, false ).slice( columnStart - 1, columnEnd ) );
    }

    return Result;
};

/**
 * Augment with another matrix.
 * @param {MatrixCommon} B Matrix
 * @returns {MatrixCommon} Augmented matrix this|B.
 * @export
 */
MatrixCommon.prototype.augment = function (B) {
    var columns = this.___dim().columns,
        columnsB = B.___dim().columns;

    if( this.___dim().rows !== B.___dim().rows ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Number of rows must match' );
    }

    var Result = this.getInstance( this.___dim().rows, columns + columnsB );

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
 * @param {MatrixCommon} M Matrix
 * @returns {number} Euclidean dot product of this and M.
 * @export
 */
MatrixCommon.prototype.dot = function (M) {
    var rows = this.___dim().rows;

    if( !this.isVector() || !M.isVector() || this.___dim().columns !== 1 || M.___dim().columns !== 1 ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a column vector' );
    }

    if( rows !== M.___dim().rows ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH );
    }

    var result = 0;
    for( var i = 1; i <= rows; i++ ) {
        result += this.___get( i, 1 ) * M.___get( i, 1 );
    }

    return result;
};

/**
 * Rounds each element to the nearest integer.
 * @see MatrixCommon.prototype.roundTo
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.round = function () {
    return this.roundTo( 0 );
};

/**
 * Rounds each element to a given number of digits.
 * @param {number} [digits=0] Precision in digits after the comma
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.roundTo = function (digits) {
    digits = MatrixUtils.getNumberWithDefault( digits, MatrixCommon.options.roundTo.digits );

    var power = Math.pow( 10, digits );
    return this.fun( function (value) {
        return Math.round( value * power ) / power;
    } );
};

/**
 * Pointwise absolute value of the matrix.
 * @returns {MatrixCommon} Matrix M with M(i,j) = abs( this(i,j) ) for all i,j.
 * @export
 */
MatrixCommon.prototype.abs = function () {
    return this.fun( function (value) {
        return Math.abs( value );
    } );
};

/**
 * Returns the cross product. Both vectors have to be column vectors. The resulting vector will also be a column vector.
 * @param {MatrixCommon} M Three-dimensional vector
 * @returns {MatrixCommon} The three-dimensional vector V = A x M.
 * @export
 */
MatrixCommon.prototype.cross = function (M) {
    if( !this.isVector() || !M.isVector() || this.___dim().rows !== 3 || M.___dim().rows !== 3 ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS,
            'Parameters must be three-dimensional column vectors' );
    }

    return this.getInstance( [
        [this.___get( 2, 1 ) * M.___get( 3, 1 ) - this.___get( 3, 1 ) * M.___get( 2, 1 )],
        [this.___get( 3, 1 ) * M.___get( 1, 1 ) - this.___get( 1, 1 ) * M.___get( 3, 1 )],
        [this.___get( 1, 1 ) * M.___get( 2, 1 ) - this.___get( 2, 1 ) * M.___get( 1, 1 )]
    ] );
};

/**
 * Add a row to the matrix.
 * @param {(Array.<number>|MatrixCommon)} row Array or matrix of entries to add
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.addRow = function (row) {
    row = MatrixUtils.toArray( row );
    var rows = this.___dim().rows;

    var Result = this.getInstance( rows + 1, this.___dim().columns );

    for( var i = 1; i <= rows; i++ ) {
        Result.__setRow( i, this.__getRow( i, false ) );
    }

    Result.__setRow( rows + 1, row );
    return Result;
};

/**
 * Add a column to the matrix.
 * @param {(Array.<number>|MatrixCommon)} column Array or matrix of entries to add
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.addColumn = function (column) {
    return this.copy().augment( this.getInstance( MatrixUtils.toArray( column ), null, 1 ) );
};

/**
 * Check if the matrix contains a certain value.
 * @param {number} needle Value to look for
 * @param {number} [precision=0] Match if any value is in [needle-precision, needle+precision]
 * @returns {boolean}
 * @export
 */
MatrixCommon.prototype.contains = function (needle, precision) {
    precision = MatrixUtils.getNumberWithDefault( precision, 0 );
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( !MatrixUtils.isNumber( needle ) || !MatrixUtils.isNumber( precision ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
    }

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            if( precision === 0 ) {
                if( this.___get( i, j ) === needle ) {
                    return true;
                }
            } else {
                if( Math.abs( this.___get( i, j ) - needle ) <= precision ) {
                    return true;
                }
            }
        }
    }

    return false;
};

/**
 * Create a string representation of the matrix.
 * @param {string} [rowSeparator=MatrixCommon.options.stringify.rowSeparator] Delimiter between columns
 * @param {string} [columnSeparator=MatrixCommon.options.stringify.columnSeparator] Delimiter between the last column of the
 * previous and first column of the next row
 * @returns {string}
 * @export
 */
MatrixCommon.prototype.stringify = function (rowSeparator, columnSeparator) {
    rowSeparator = MatrixUtils.getStringWithDefault( rowSeparator, MatrixCommon.options.stringify.rowSeparator );
    columnSeparator = MatrixUtils.getStringWithDefault( columnSeparator, MatrixCommon.options.stringify.columnSeparator );

    var outputRows = [],
        current,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        current = [];

        for( var j = 1; j <= columns; j++ ) {
            current.push( this.___get( i, j ) );
        }

        outputRows.push( current.join( columnSeparator ) );
    }

    return outputRows.join( rowSeparator );
};

/**
 * Compare with another matrix.
 * @param {MatrixCommon} M Matrix
 * @returns {boolean} True if A = M, false otherwise.
 * @export
 */
MatrixCommon.prototype.equals = function (M) {
    var rows = this.___dim().rows,
        columns = this.___dim().columns;

    if( rows !== M.___dim().rows || columns !== M.___dim().columns ) {
        return false;
    }

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            if( this.___get( i, j ) !== M.___get( i, j ) ) {
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
 * applicators can be found at {@link MatrixUtils.applicators}.
 * @param {?function(number, number, number): boolean} [filter=MatrixUtils.filters.all] A function that will be called with
 * the same arguments as applicator. If provided, applicator will only be applied if filter evaluates to true.
 * Predefined filters can be found at {@link MatrixUtils.filters}.
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.fun = function (applicator, filter) {
    filter = filter || MatrixUtils.filters.all;

    if( typeof applicator !== 'function' ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Applicator must be a function' );
    }

    if( typeof filter !== 'function' ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Filter must be a function' );
    }

    var Result = this.copy(),
        current,
        rows = Result.___dim().rows,
        columns = Result.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            current = Result.___get( i, j );

            if( filter( current, i, j ) ) {
                Result.___set( i, j, applicator( current, i, j ) );
            }
        }
    }

    return Result;
};

/**
 * Apply a custom function to each non-zero entry.
 * @param {function(number, number, number): number} applicator Function to apply. It will be provided with three
 * arguments (value, row index, column index) and has to return the new value to write in the matrix. Predefined
 * applicators can be found at {@link MatrixUtils.applicators}.
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.spfun = function (applicator) {
    return this.fun( applicator, MatrixUtils.filters.nonZero );
};

/**
 * Apply the exponential function point-wise.
 * @returns {MatrixCommon}
 * @export
 */
MatrixCommon.prototype.pw_exp = function () {
    return this.fun( MatrixUtils.applicators.exp, null );
};

/**
 * Raise to the n-th power point-wise.
 * @param {number} n Power
 * @returns {MatrixCommon} The matrix M^n.
 * @export
 */
MatrixCommon.prototype.pw_pow = function (n) {
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
MatrixCommon.prototype.norm = function (which, args) {
    which = MatrixUtils.getStringWithDefault( which, MatrixCommon.options.norm.which );
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
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Norm not supported' );
    }
};

/**
 * Calculate the p-norm.
 * @param {number} p
 * @returns {number}
 * @export
 */
MatrixCommon.prototype.pnorm = function (p) {
    if( !MatrixUtils.isInteger( p ) ) {
        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be an integer' );
    }

    var norm = 0,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            norm += Math.pow( Math.abs( this.___get( i, j ) ), p );
        }
    }

    return Math.pow( norm, 1 / p );
};

/**
 * Calculate the maximum norm.
 * @returns {number}
 * @export
 */
MatrixCommon.prototype.maxnorm = function () {
    var norm = 0,
        rows = this.___dim().rows,
        columns = this.___dim().columns;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            norm = Math.max( norm, Math.abs( this.___get( i, j ) ) );
        }
    }

    return norm;
};

/**
 * Calculate the row-sum norm.
 * @returns {number}
 * @export
 */
MatrixCommon.prototype.rownorm = function () {
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
MatrixCommon.prototype.columnnorm = function () {
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
MatrixCommon.prototype.diag = function (k) {
    k = MatrixUtils.getNumberWithDefault( k, 0 );

    var diag = [],
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 ),
        endOfLoop = (rowOffset === 0 ) ? (this.___dim().columns - columnOffset) : (this.___dim().rows - rowOffset);

    if( endOfLoop <= 0 ) {
        throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
    }

    for( var i = 1; i <= endOfLoop; i++ ) {
        diag.push( this.___get( i + rowOffset, i + columnOffset ) );
    }

    return diag;
};

/**
 * Check if a given position is in the range of the matrix.
 * If either parameter is null, it will not be considered.
 * @param {?number} row
 * @param {?number} column
 * @returns {boolean}
 * @export
 */
MatrixCommon.prototype.isInRange = function (row, column) {
    return (!MatrixUtils.isNumber( row ) || ( row >= 1 && row <= this.___dim().rows ) )
        && (!MatrixUtils.isNumber( column ) || ( column >= 1 && column <= this.___dim().columns ) );
};

/*
 ======================================================================================================================
 ================================================== Matrix ============================================================
 ======================================================================================================================
 */

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
    columns = MatrixUtils.getNumberWithDefault( columns, rows );

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
    columns = MatrixUtils.getNumberWithDefault( columns, rows );
    var Result = new Matrix( rows, columns );

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            Result.___set( i, j, 1 );
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
        Result.___set( i, i, 1 );
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
    entries = MatrixUtils.toArray( entries );
    k = MatrixUtils.getNumberWithDefault( k, 0 );

    var Result = new Matrix( entries.length + Math.abs( k ) ),
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 ),
        endOfLoop = ( Result.___dim().rows - Math.abs( k ) );

    for( var i = 1; i <= endOfLoop; i++ ) {
        Result.___set( i + rowOffset, i + columnOffset, entries[i - 1] );
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
    columns = MatrixUtils.getNumberWithDefault( columns, rows );
    minVal = MatrixUtils.getNumberWithDefault( minVal, MatrixCommon.options.random.minVal );
    maxVal = MatrixUtils.getNumberWithDefault( maxVal, MatrixCommon.options.random.maxVal );
    onlyInteger = MatrixUtils.getBooleanWithDefault( onlyInteger, MatrixCommon.options.random.onlyInteger );

    var Result = new Matrix( rows, columns ),
        factor = ( maxVal - minVal ) + ( (onlyInteger) ? 1 : 0 ),
        current;

    for( var i = 1; i <= rows; i++ ) {
        for( var j = 1; j <= columns; j++ ) {
            current = minVal + ( Math.random() * factor );
            if( onlyInteger ) {
                current = current | 0;
            }

            Result.___set( i, j, current );
        }
    }

    return Result;
};

/*
 ======================================================================================================================
 ================================================ MatrixUtils =========================================================
 ======================================================================================================================
 */

/**
 * @static
 */
MatrixUtils.isNumber = function (k) {
    return typeof k === 'number';
};

/**
 * @static
 */
MatrixUtils.isInteger = function (k) {
    return MatrixUtils.isNumber( k ) && (k | 0) === k;
};

/**
 * @static
 */
MatrixUtils.isMatrix = function (obj) {
    return obj instanceof Matrix;
};

/**
 * @static
 */
MatrixUtils.isNumberArray = function (obj) {
    for( var i = 0; i < obj.length; i++ ) {
        if( !MatrixUtils.isNumber( obj[i] ) ) {
            return false;
        }
    }

    return true;
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
MatrixUtils.linspace = function (start, end, step) {
    step = MatrixUtils.getNumberWithDefault( step, 1 );
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
 * @returns {Array.<number>}
 * @export
 */
MatrixUtils.repeat = function (times, value) {
    var result = [];
    for( var i = 1; i <= times; i++ ) {
        result[i - 1] = value;
    }

    return result;
};

/**
 * @param {(MatrixCommon|Array.<number>)} obj
 * @static
 */
MatrixUtils.toArray = function (obj) {
    if( !MatrixUtils.isMatrix( obj ) ) {
        return obj;
    }

    if( !obj.isVector() ) {
        throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Argument has to be vector' );
    }

    var temp_obj = obj.copy();
    if( obj.dim( 'max' ) !== obj.___dim().rows ) {
        temp_obj = temp_obj.transpose();
    }

    var result = [],
        rows = temp_obj.___dim().rows;

    for( var i = 1; i <= rows; i++ ) {
        result.push( temp_obj.___get( i, 1 ) );
    }

    return result;
};

/**
 * @static
 */
MatrixUtils.getNumberWithDefault = function (obj, defaultValue) {
    return (MatrixUtils.isNumber( obj )) ? obj : defaultValue;
};

/**
 * @static
 */
MatrixUtils.getStringWithDefault = function (obj, defaultValue) {
    return (typeof obj === 'string') ? obj : defaultValue;
};

/**
 * @static
 */
MatrixUtils.getBooleanWithDefault = function (obj, defaultValue) {
    return (typeof obj === 'boolean') ? obj : defaultValue;
};


/**
 * Predefined filters that can be used with methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 * @static
 * @export
 */
MatrixUtils.filters = {
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
MatrixUtils.applicators = {
    /** @expose */
    exp: function (value) {
        return Math.exp( value );
    },

    /** @expose */
    square: function (value) {
        return value * value;
    }
};

/*
 ======================================================================================================================
 =================================================== Other ============================================================
 ======================================================================================================================
 */

/**
 * Convert array to matrix.
 * This method simply calls the {@link Matrix} constructor.
 * @param {number} [rows] Number of rows
 * @param {number} [columns] Number of columns
 * @returns {Matrix}
 * @export
 */
Array.prototype.toMatrix = function (rows, columns) {
    // TODO: add flag to specify matrix type

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
    // TODO: Return vector instance instead of Matrix

    isRowVector = MatrixUtils.getBooleanWithDefault( isRowVector, false );

    // TODO use vectors
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
    // TODO: add flag to define matrix type and adjust documentation accordingly

    rowSeparator = MatrixUtils.getStringWithDefault( rowSeparator, '\r\n' );
    columnSeparator = MatrixUtils.getStringWithDefault( columnSeparator, '\t' );

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
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Number of columns is inconsistent' );
        }

        for( var j = 1; j <= numColumns; j++ ) {
            Result.___set( i + 1, j, Number( columns[j - 1] ) );
        }
    }

    return Result;
};