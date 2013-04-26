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

(function (window) {
    function isNumber (k) {
        return typeof k === 'number';
    }

    function isInteger (k) {
        return isNumber( k ) && (k | 0) === k;
    }

    function isNumberArray (obj) {
        for( var i = 0; i < obj.length; i++ ) {
            if( !isNumber( obj[i] ) ) {
                return false;
            }
        }

        return true;
    }

    function getNumberWithDefault (obj, defaultValue) {
        return (isNumber( obj )) ? obj : defaultValue;
    }

    function getStringWithDefault (obj, defaultValue) {
        return (typeof obj === 'string') ? obj : defaultValue;
    }

    function getBooleanWithDefault (obj, defaultValue) {
        return (typeof obj === 'boolean') ? obj : defaultValue;
    }

    /**
     * Static class for utility functions.
     * @static
     * @constructor
     */
    function MatrixUtils () {
        throw new Error( 'This cannot be instantiated' );
    }

    /**
     * Error thrown by matrixjs.
     * @param {string} code Error code, one of {@link MatrixError.ErrorCodes}
     * @param {string} [msg] Additional message string
     * @constructor
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
     */
    MatrixError.ErrorCodes = {
        /** @expose */ INVALID_PARAMETERS: 'Invalid parameters',
        /** @expose */ OUT_OF_BOUNDS: 'Out of bounds',
        /** @expose */ DIMENSION_MISMATCH: 'Dimension mismatch',
        /** @expose */ MATRIX_IS_SINGULAR: 'Matrix is singular',
        /** @expose */ UNKNOWN_TYPE: 'Unknown type'
    };

    /**
     * Creates a new Matrix.
     * There is a number of different signatures for the parameter(s) to define the matrix.
     *  - Use one number n to create a n-by-n matrix filled with zeros.
     *  - Use two numbers m, n to create a m-by-n matrix filled with zeros.
     *  - Use an array of arrays, wherein the inner arrays represent entire rows.
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
     */
    function Matrix (var_args) {
        var args = [].slice.call( arguments ),
            __rows, __columns,
            __elements = [];

        /**
         * @override
         * @private
         */
        this.___get = function (row, column) {
            return __elements[__columns * (row - 1) + column - 1];
        };

        /**
         * @override
         * @private
         */
        this.___set = function (row, column, value) {
            __elements[__columns * (row - 1) + column - 1] = value;
            return this;
        };

        /**
         * Get the number of rows.
         * @returns {number}
         * @override
         */
        this.rows = function () {
            return __rows;
        };

        /**
         * Get the number of columns.
         * @returns {number}
         * @override
         */
        this.columns = function () {
            return __columns;
        };

        /**
         * @override
         * @private
         */
        this.___getElements = function () {
            return __elements;
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
                    if( !isNumberArray( args[0][i] ) ) {
                        throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
                    }

                    __columns = Math.max( __columns, args[0][i].length );
                    __elements = __elements.concat( args[0][i] );
                }
            } else if( args.length >= 1 && args.length <= 3 && args[0] instanceof Array
                && ( args[0].length === 0 || isNumber( args[0][0] ) ) ) {

                if( !isNumberArray( args[0] ) ) {
                    throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Elements must be numbers' );
                }

                __elements = args[0];
                var rows = args[1],
                    columns = args[2];

                if( !isNumber( rows ) && !isNumber( columns ) ) {
                    var dim = Math.sqrt( __elements.length );

                    rows = dim;
                    columns = dim;
                } else if( !isNumber( rows ) && isInteger( columns ) ) {
                    rows = __elements.length / columns;
                } else if( isInteger( rows ) && !isNumber( columns ) ) {
                    columns = __elements.length / rows;
                }

                if( !isInteger( rows ) || !isInteger( columns ) ) {
                    throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS,
                        'Array must represent square matrix if no size is given' );
                }

                __rows = rows;
                __columns = columns;
            } else if( args.length === 1 && isInteger( args[0] ) ) {
                __rows = args[0];
                __columns = args[0];
                __elements = MatrixUtils.repeat( __rows * __columns, 0 );
            } else if( args.length === 2 && isInteger( args[0] ) && isInteger( args[1] ) ) {
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

    /**
     * TODO documentation
     * @constructor
     * @param {...*} var_args
     */
    function SparseMatrix (var_args) {
        var args = [].slice.call( arguments ),
            __columns,
            __elements = [],
            __columnIndicator = [],
            __rowPointer = [];

        /**
         * @override
         * @private
         */
        this.___get = function (row, column) {
            for( var k = __rowPointer[row - 1]; k < __rowPointer[row]; k++ ) {
                if( __columnIndicator[k] === column ) {
                    return __elements[k];
                }
            }

            return 0;
        };

        /**
         * @override
         * @private
         */
        this.___set = function (row, column, value) {
            var row_index = __rowPointer[row];
            __elements.splice( row_index, 0, value );
            __columnIndicator.splice( row_index, 0, column );

            for( var i = row; i < __rowPointer.length; i++ ) {
                __rowPointer[i] += 1;
            }

            return this;
        };

        /**
         * Get the number of rows.
         * @returns {number}
         * @override
         */
        this.rows = function () {
            return __rowPointer.length - 1;
        };

        /**
         * Get the number of columns.
         * @returns {number}
         * @override
         */
        this.columns = function () {
            return __columns;
        };

        (function () {
            // TODO
            __elements = [1, 2, 3];
            __columnIndicator = [1, 2, 3];
            __rowPointer = [0, 1, 2, 3];
            __columns = 3;
        })();

        return this;
    }

    /**
     * TODO documentation
     * @constructor
     * @param {...*} var_args
     */
    function Vector (var_args) {
        var args = [].slice.call( arguments ),
            isRowVector,
            __elements = [];

        /**
         * @override
         * @private
         */
        this.___get = function (row, column) {
            return __elements[(isRowVector) ? (row - 1) : (column - 1)];
        };

        /**
         * @override
         * @private
         */
        this.___set = function (row, column, value) {
            __elements[(isRowVector) ? (row - 1) : (column - 1)] = value;
            return this;
        };

        /**
         * Get the number of rows.
         * @returns {number}
         * @override
         */
        this.rows = function () {
            return (isRowVector) ? __elements.length : 1;
        };

        /**
         * Get the number of columns.
         * @returns {number}
         * @override
         */
        this.columns = function () {
            return (isRowVector) ? 1 : __elements.length;
        };

        (function () {
            // TODO constructor
        })();

        return this;
    }

    /**
     * Default settings
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
     * Get an entry from the matrix.
     * @param {number} row
     * @param {number} column
     * @returns {number}
     */
    Matrix.prototype.get = function (row, column) {
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
     * @returns {Matrix}
     */
    Matrix.prototype.set = function (row, column, value) {
        if( !this.isInRange( row, column ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
        }

        if( !isNumber( value ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Value has to be a number' );
        }

        return this.___set( row, column, value );
    };

    /**
     * Get a row.
     * @param {number} row The row index of the row that shall be returned
     * @param {boolean} [asMatrix=false] If true, the row will be returned as a matrix, otherwise as an array.
     * @returns {Array.<number>|Matrix} Array of the elements in the specified row.
     */
    Matrix.prototype.getRow = function (row, asMatrix) {
        asMatrix = getBooleanWithDefault( asMatrix, false );

        if( !this.isInRange( row, null ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
        }

        return this.__getRow( row, asMatrix );
    };

    /**
     * @private
     * @ignore
     */
    Matrix.prototype.__getRow = function (row, asMatrix) {
        var result = [],
            columns = this.columns();

        for( var i = 1; i <= columns; i++ ) {
            result.push( this.___get( row, i ) );
        }

        return (asMatrix) ? new Matrix( result, 1 ) : result;
    };

    /**
     * Replace a row.
     * Note: This function modifies the instance it is called on.
     * @param {number} row The row index of the row to replace
     * @param {(Array.<number>|Matrix)} entries An array or Matrix containing the new entries for the row
     * @returns {Matrix}
     */
    Matrix.prototype.setRow = function (row, entries) {
        entries = MatrixUtils.toArray( entries );

        if( !this.isInRange( row, null ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
        }

        if( entries.length !== this.columns() ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of columns in row.' );
        }

        return this.__setRow( row, entries );
    };

    /**
     * @private
     * @ignore
     */
    Matrix.prototype.__setRow = function (row, entries) {
        var columns = this.columns();

        for( var i = 1; i <= columns; i++ ) {
            this.___set( row, i, entries[i - 1] );
        }

        return this;
    };

    /**
     * Get a column.
     * @param {number} column The column index of the column that shall be returned
     * @param {boolean} [asMatrix=false] If true, the column will be returned as a matrix, otherwise as an array.
     * @returns {(Array.<number>|Matrix)} Array of the elements in the specified column.
     */
    Matrix.prototype.getColumn = function (column, asMatrix) {
        asMatrix = getBooleanWithDefault( asMatrix, false );

        if( !this.isInRange( null, column ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
        }

        return this.__getColumn( column, asMatrix );
    };

    /**
     * @private
     * @ignore
     */
    Matrix.prototype.__getColumn = function (column, asMatrix) {
        var result = [],
            rows = this.rows();

        for( var i = 1; i <= rows; i++ ) {
            result.push( this.___get( i, column ) );
        }

        return (asMatrix) ? new Matrix( result, null, 1 ) : result;
    };

    /**
     * Replace a column.
     * Note: This function modifies the instance it is called on.
     * @param {number} column The column index of the column to replace
     * @param {(Array.<number>|Matrix)} entries An array or matrix containing the new entries for the column
     * @returns {Matrix}
     */
    Matrix.prototype.setColumn = function (column, entries) {
        entries = MatrixUtils.toArray( entries );

        if( !this.isInRange( null, column ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
        }

        if( entries.length !== this.rows() ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Wrong number of rows in column' );
        }

        return this.__setColumn( column, entries );
    };

    /**
     * @private
     * @ignore
     */
    Matrix.prototype.__setColumn = function (column, entries) {
        var rows = this.rows();

        for( var i = 1; i <= rows; i++ ) {
            this.___set( i, column, entries[i - 1] );
        }

        return this;
    };

    /**
     * Check if matrix has the same dimensions as another matrix.
     * @param {Matrix} M
     * @returns {boolean}
     */
    Matrix.prototype.isSameSizeAs = function (M) {
        return ( this.rows() === M.rows() && this.columns() === M.columns() );
    };

    /**
     * Check if the matrix is a sparse matrix.
     * Note: This method only checks if the matrix is an instance of SparseMatrix. It does not actually check the values
     * and decide whether it is suitable to be sparse-typed.
     * @returns {boolean}
     */
    Matrix.prototype.isSparse = function () {
        return ( this instanceof SparseMatrix );
    };

    /**
     * Check if the matrix is a vector.
     * @returns {boolean} True if at least one dimension is 1.
     */
    Matrix.prototype.isVector = function () {
        return this.dim( 'min' ) === 1;
    };

    /**
     * Check if the matrix is a square matrix.
     * @returns {boolean} True if the number of rows and columns equal, false otherwise.
     */
    Matrix.prototype.isSquare = function () {
        return this.rows() === this.columns();
    };

    /**
     * Check if the matrix is symmetric.
     * @returns {boolean}
     */
    Matrix.prototype.isSymmetric = function () {
        if( !this.isSquare() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
        }

        var rows = this.rows();

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
     * @param {string} [mode='both'] What kind of triangular matrix to check for. Possible values are:
     *  - 'lower': True if lower triangular matrix, false otherwise
     *  - 'upper': True if upper triangular matrix, false otherwise
     *  - 'both': True if either lower or upper triangular, false otherwise
     * @returns {boolean}
     */
    Matrix.prototype.isTriangular = function (mode) {
        mode = getStringWithDefault( mode, Matrix.options.isTriangular.mode );

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
    Matrix.prototype.__isTriangular = function (upper) {
        var sign = (upper) ? 1 : -1,
            diag, num_diag,
            rows = this.rows();

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
     */
    Matrix.prototype.copy = function () {
        return new Matrix( this.toArray(), this.rows(), this.columns() );
    };

    /**
     * Returns the number of elements in the matrix.
     * @returns {number}
     */
    Matrix.prototype.size = function () {
        return this.rows() * this.columns();
    };

    /**
     * Get the dimensions of the matrix.
     * @param {(number|string)} which Define which dimension should be returned. Possible values are:
     *  - 1 or 'rows' : Number of rows
     *  - 2 or 'columns' : Number of columns
     *  - 'max' : Dominant dimension
     *  - 'min' : Smaller dimension
     * @returns {number} Object with the dimensions of requested dimension or just
     * the requested dimension.
     */
    Matrix.prototype.dim = function (which) {
        switch( which ) {
            case 1:
            case 'rows':
                return this.rows();
            case 2:
            case 'columns':
                return this.columns();
            case 'max':
                return Math.max( this.rows(), this.columns() );
            case 'min':
                return Math.min( this.rows(), this.columns() );
            default:
                throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must match a known value' );
        }
    };

    /**
     * Add a matrix.
     * If more than one matrix is passed, they will be added in order, i.e. this + M + N + ...
     * @param {Matrix} M Matrix
     * @returns {Matrix} Component-wise sum of this and M.
     */
    Matrix.prototype.add = function (M) {
        var rows = this.rows(),
            columns = this.columns();

        if( arguments.length > 1 ) {
            var args = [].slice.call( arguments );
            return this.add.apply( this.add( args.shift() ), args );
        }

        if( !this.isSameSizeAs( M ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
        }

        var Result = new Matrix( rows, columns ),
            rowA, rowB;

        for( var i = 1; i <= rows; i++ ) {
            rowA = this.__getRow( i, false );
            rowB = M.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                rowA[j] += rowB[j];
            }

            Result.__setRow( i, rowA );
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
        var rows = this.rows(),
            columns = this.columns();

        if( arguments.length > 1 ) {
            var args = [].slice.call( arguments );
            return this.subtract.apply( this.subtract( args.shift() ), args );
        }

        if( !this.isSameSizeAs( M ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrices must be of the same size' );
        }

        var Result = new Matrix( rows, columns ),
            rowA, rowB;

        for( var i = 1; i <= rows; i++ ) {
            rowA = this.__getRow( i, false );
            rowB = M.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                rowA[j] -= rowB[j];
            }

            Result.__setRow( i, rowA );
        }

        return Result;
    };

    /**
     * Scale with a constant factor (i.e. calculate k * this)
     * @param {number} k Factor
     * @returns {Matrix} Matrix with all entries multiplied by k.
     */
    Matrix.prototype.scale = function (k) {
        if( !isNumber( k ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
        }

        var rows = this.rows(),
            columns = this.columns(),
            Result = new Matrix( rows, columns ),
            row;

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                row[j] *= k;
            }

            Result.__setRow( i, row );
        }

        return Result;
    };

    /**
     * Multiply with another matrix.
     * @param {Matrix} M
     * @returns {Matrix}
     */
    Matrix.prototype.multiply = function (M) {
        var dimOuterLeft = this.rows(),
            dimInner = this.columns(),
            dimOuterRight = M.columns();

        if( dimInner !== M.rows() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Inner dimensions must match' );
        }

        var Result = new Matrix( dimOuterLeft, dimOuterRight );
        for( var i = 1; i <= dimOuterLeft; i++ ) {
            for( var j = 1; j <= dimOuterRight; j++ ) {
                var temp = 0,
                    rowA = this.__getRow( i, false ),
                    columnB = M.__getColumn( j, false );

                for( var k = 0; k < dimInner; k++ ) {
                    temp += rowA[k] * columnB[k];
                }

                Result.___set( i, j, temp );
            }
        }

        return Result;
    };

    /**
     * Transpose the matrix, i.e. take the rows as the columns of the resulting matrix.
     * @returns {Matrix}
     */
    Matrix.prototype.transpose = function () {
        var rows = this.rows(),
            Result = new Matrix( this.columns(), rows );

        for( var i = 1; i <= rows; i++ ) {
            Result.__setColumn( i, this.__getRow( i, false ) );
        }

        return Result;
    };

    /**
     * Calculate the trace, i.e. the sum of all diagonal entries.
     * @returns {number} Sum of diagonal entries.
     */
    Matrix.prototype.trace = function () {
        if( !this.isSquare() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
        }

        var rows = this.rows(),
            trace = 0;

        for( var i = 1; i <= rows; i++ ) {
            trace += this.___get( i, i );
        }

        return trace;
    };

    /**
     * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
     * diagonal entries will not be stored.
     * @returns {Matrix} Matrix with the LU entries. There is also a hidden property swappedRows with the number
     * of rows that were swapped in the process.
     */
    Matrix.prototype.decomposeLU = function () {
        var swappedRows = 0,
            LU = this.copy();

        var i, j, k,
            row_k, column_k, row_i,
            rows = this.rows(),
            columns = this.columns();

        var pivot, maxArg, currArg, tempRow;

        for( k = 1; k <= rows; k++ ) {
            pivot = 0;
            maxArg = -1;

            column_k = LU.__getColumn( k, false );
            for( i = k; i <= rows; i++ ) {
                currArg = Math.abs( column_k[i - 1] );

                if( currArg >= maxArg ) {
                    pivot = i;
                    maxArg = currArg;
                }
            }

            if( column_k[pivot - 1] === 0 ) {
                throw new MatrixError( MatrixError.ErrorCodes.MATRIX_IS_SINGULAR );
            }

            if( pivot !== k ) {
                tempRow = LU.__getRow( pivot, false );

                LU.__setRow( pivot, LU.__getRow( k, false ) );
                LU.__setRow( k, tempRow );

                swappedRows++;
            }

            row_k = LU.__getRow( k, false );
            for( i = k + 1; i <= rows; i++ ) {
                row_i = LU.__getRow( i, false );

                for( j = k; j < columns; j++ ) {
                    row_i[j] = row_i[j] - row_k[j] * ( row_i[k - 1] ) / row_k[k - 1];
                }

                row_i[k - 1] = 0;
                LU.__setRow( i, row_i );
            }
        }

        // as a "hidden property" we attach the number of swapped rows
        LU.swappedRows = swappedRows;

        return LU;
    };

    /**
     * Calculate the determinant.
     * @returns {number}
     */
    Matrix.prototype.det = function () {
        var i, det, diag,
            rows = this.rows();

        if( !this.isSquare() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
        }

        if( this.isTriangular() ) {
            det = 1;
            diag = this.diag();

            for( i = 0; i < rows; i++ ) {
                det *= diag[i];
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
            diag = LU.diag();

            for( i = 0; i < rows; i++ ) {
                det *= diag[i];
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
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Matrix must be square' );
        }

        var M = this.augment( Matrix.eye( this.rows() ) ),
            row, row_before, new_row, i, j, k, factor, rows, columns;

        try {
            M = M.decomposeLU();
            rows = M.rows();
            columns = M.columns();

            // TODO The following two loops can probably be rewritten into something smarter
            for( i = rows; i > 1; i-- ) {
                row_before = M.__getRow( i - 1, false );
                row = M.__getRow( i, false );
                factor = row_before[i - 1] / row[i - 1];

                new_row = [];
                for( k = 0; k < columns; k++ ) {
                    new_row[k] = row_before[k] - row[k] * factor;
                }
                M.__setRow( i - 1, new_row );
            }

            for( j = 1; j <= rows; j++ ) {
                row = M.__getRow( j, false );
                new_row = [];

                for( k = 0; k < columns; k++ ) {
                    new_row[k] = row[k] / row[j - 1];
                }

                M.__setRow( j, new_row );
            }
        } catch( e ) {
            // TODO if caching attributes like the determinant is introduced, replace this by checking
            // the determinant and throw a general error here
            throw new MatrixError( MatrixError.ErrorCodes.MATRIX_IS_SINGULAR );
        }

        return M.submatrix( 1, rows, this.columns() + 1, columns );
    };

    /**
     * Extract a submatrix.
     * @param {number} rowStart Row index where to start the cut
     * @param {number} rowEnd Row index where to end the cut
     * @param {number} columnStart Column index where to start the cut
     * @param {number} columnEnd Column index where to end the cut
     * @returns {Matrix}
     */
    Matrix.prototype.submatrix = function (rowStart, rowEnd, columnStart, columnEnd) {
        if( !this.isInRange( rowStart, columnStart ) || !this.isInRange( rowEnd, columnEnd )
            || rowStart > rowEnd || columnStart > columnEnd ) {
            throw new MatrixError( MatrixError.ErrorCodes.OUT_OF_BOUNDS );
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
     * @param {Matrix} M
     * @returns {Matrix}
     */
    Matrix.prototype.augment = function (M) {
        var rows = this.rows(),
            columns = this.columns(),
            columnsM = M.columns();

        if( rows !== M.rows() ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Number of rows must match' );
        }

        var Result = new Matrix( rows, columns + columnsM );

        for( var i = 1; i <= columns; i++ ) {
            Result.__setColumn( i, this.__getColumn( i, false ) );
        }
        for( var j = 1; j <= columnsM; j++ ) {
            Result.__setColumn( j + columns, M.__getColumn( j, false ) );
        }

        return Result;
    };

    /**
     * Calculate the dot product. Both vectors have to be column vectors.
     * @param {Matrix} M Matrix
     * @returns {number} Euclidean dot product of this and M.
     */
    Matrix.prototype.dot = function (M) {
        var rows = this.rows();

        if( !this.isVector() || !M.isVector() || this.columns() !== 1 || M.columns() !== 1 ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a column vector' );
        }

        if( rows !== M.rows() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH );
        }

        var result = 0;
        for( var i = 1; i <= rows; i++ ) {
            // TODO speed improvement
            result += this.___get( i, 1 ) * M.___get( i, 1 );
        }

        return result;
    };

    /**
     * Rounds each element to the nearest integer.
     * @see Matrix.prototype.roundTo
     * @returns {Matrix}
     */
    Matrix.prototype.round = function () {
        return this.roundTo( 0 );
    };

    /**
     * Rounds each element to a given number of digits.
     * @param {number} [digits=0] Precision in digits after the comma
     * @returns {Matrix}
     */
    Matrix.prototype.roundTo = function (digits) {
        digits = getNumberWithDefault( digits, Matrix.options.roundTo.digits );

        var power = Math.pow( 10, digits );
        return this.fun( function (value) {
            return Math.round( value * power ) / power;
        } );
    };

    /**
     * Pointwise absolute value of the matrix.
     * @returns {Matrix} Matrix M with M(i,j) = abs( this(i,j) ) for all i,j.
     */
    Matrix.prototype.abs = function () {
        return this.fun( function (value) {
            return Math.abs( value );
        } );
    };

    /**
     * Returns the cross product. Both vectors have to be column vectors. The resulting vector will also be a column vector.
     * @param {Matrix} M Three-dimensional vector
     * @returns {Matrix} The three-dimensional vector V = A x M.
     */
    Matrix.prototype.cross = function (M) {
        if( !this.isVector() || !M.isVector() || this.rows() !== 3 || M.rows() !== 3 ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS,
                'Parameters must be three-dimensional column vectors' );
        }

        // TODO speed improvement
        return new Matrix( [
            [this.___get( 2, 1 ) * M.___get( 3, 1 ) - this.___get( 3, 1 ) * M.___get( 2, 1 )],
            [this.___get( 3, 1 ) * M.___get( 1, 1 ) - this.___get( 1, 1 ) * M.___get( 3, 1 )],
            [this.___get( 1, 1 ) * M.___get( 2, 1 ) - this.___get( 2, 1 ) * M.___get( 1, 1 )]
        ] );
    };

    /**
     * Add a row to the matrix.
     * @param {(Array.<number>|Matrix)} row Array or matrix of entries to add
     * @returns {Matrix}
     */
    Matrix.prototype.addRow = function (row) {
        row = MatrixUtils.toArray( row );
        var rows = this.rows();

        var Result = new Matrix( rows + 1, this.columns() );

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
     */
    Matrix.prototype.addColumn = function (column) {
        return this.copy().augment( new Matrix( MatrixUtils.toArray( column ), null, 1 ) );
    };

    /**
     * Check if the matrix contains a certain value.
     * @param {number} needle Value to look for
     * @param {number} [precision=0] Match if any value is in [needle-precision, needle+precision]
     * @returns {boolean}
     */
    Matrix.prototype.contains = function (needle, precision) {
        precision = getNumberWithDefault( precision, 0 );
        var rows = this.rows(),
            columns = this.columns(),
            row;

        if( !isNumber( needle ) || !isNumber( precision ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be a number' );
        }

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                if( precision === 0 ) {
                    if( row[j] === needle ) {
                        return true;
                    }
                } else {
                    if( Math.abs( row[j] - needle ) <= precision ) {
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
     */
    Matrix.prototype.stringify = function (rowSeparator, columnSeparator) {
        rowSeparator = getStringWithDefault( rowSeparator, Matrix.options.stringify.rowSeparator );
        columnSeparator = getStringWithDefault( columnSeparator, Matrix.options.stringify.columnSeparator );

        var outputRows = [],
            current,
            rows = this.rows();

        for( var i = 1; i <= rows; i++ ) {
            current = this.__getRow( i, false );
            outputRows.push( current.join( columnSeparator ) );
        }

        return outputRows.join( rowSeparator );
    };

    /**
     * Compare with another matrix.
     * @param {Matrix} M Matrix
     * @returns {boolean} True if A = M, false otherwise.
     */
    Matrix.prototype.equals = function (M) {
        var rows = this.rows(),
            columns = this.columns(),
            row, other_row;

        if( !this.isSameSizeAs( M ) ) {
            return false;
        }

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );
            other_row = M.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                if( row[j] !== other_row[j] ) {
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
     * @returns {Matrix}
     */
    Matrix.prototype.fun = function (applicator, filter) {
        filter = filter || MatrixUtils.filters.all;

        if( typeof applicator !== 'function' ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Applicator must be a function' );
        }

        if( typeof filter !== 'function' ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Filter must be a function' );
        }

        var current, row,
            rows = this.rows(),
            columns = this.columns(),
            Result = new Matrix( rows, columns );

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );

            for( var j = 1; j <= columns; j++ ) {
                current = row[j - 1];

                if( filter( current, i, j ) ) {
                    row[j - 1] = applicator( current, i, j );
                }
            }

            Result.__setRow( i, row );
        }

        return Result;
    };

    /**
     * Apply a custom function to each non-zero entry.
     * @param {function(number, number, number): number} applicator Function to apply. It will be provided with three
     * arguments (value, row index, column index) and has to return the new value to write in the matrix. Predefined
     * applicators can be found at {@link MatrixUtils.applicators}.
     * @returns {Matrix}
     */
    Matrix.prototype.spfun = function (applicator) {
        return this.fun( applicator, MatrixUtils.filters.nonZero );
    };

    /**
     * Apply the exponential function point-wise.
     * @returns {Matrix}
     */
    Matrix.prototype.pw_exp = function () {
        return this.fun( MatrixUtils.applicators.exp, null );
    };

    /**
     * Raise to the n-th power point-wise.
     * @param {number} n Power
     * @returns {Matrix} The matrix M^n.
     */
    Matrix.prototype.pw_pow = function (n) {
        return this.fun( function (value) {
            return Math.pow( value, n );
        }, null );
    };

    /**
     * Calculate the norm.
     * @param {string} [which='max'] Which norm to compute. Possible values are:
     *  - 'p' or 'pnorm': Entry-wise p-norm. The args parameter is required and has to specify p.
     *  - 'frobenius': Frobenius norm, a.k.a. the 2-norm.
     *  - 'rows' or 'rowsum': Row-sum norm.
     *  - 'columns' or 'columnsum': Column-sum norm.
     *  - 'max': Maximum norm.
     * @param {(Object|Number)} [args] Additional parameters a norm may need, e.g. the parameter p for p-norms
     * @returns {number}
     */
    Matrix.prototype.norm = function (which, args) {
        which = getStringWithDefault( which, Matrix.options.norm.which );
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
     */
    Matrix.prototype.pnorm = function (p) {
        if( !isInteger( p ) ) {
            throw new MatrixError( MatrixError.ErrorCodes.INVALID_PARAMETERS, 'Parameter must be an integer' );
        }

        var norm = 0,
            rows = this.rows(),
            columns = this.columns(),
            row;

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                norm += Math.pow( Math.abs( row[j] ), p );
            }
        }

        return Math.pow( norm, 1 / p );
    };

    /**
     * Calculate the maximum norm.
     * @returns {number}
     */
    Matrix.prototype.maxnorm = function () {
        var norm = 0,
            rows = this.rows(),
            columns = this.columns(),
            row;

        for( var i = 1; i <= rows; i++ ) {
            row = this.__getRow( i, false );

            for( var j = 0; j < columns; j++ ) {
                norm = Math.max( norm, Math.abs( row[j] ) );
            }
        }

        return norm;
    };

    /**
     * Calculate the row-sum norm.
     * @returns {number}
     */
    Matrix.prototype.rownorm = function () {
        var norm = 0,
            rows = this.rows();

        for( var i = 1; i <= rows; i++ ) {
            norm = Math.max( norm, this.__getRow( i, true ).pnorm( 1 ) );
        }

        return norm;
    };

    /**
     * Calculate the column-sum norm.
     * @returns {number}
     */
    Matrix.prototype.columnnorm = function () {
        var norm = 0,
            columns = this.columns();

        for( var i = 1; i <= columns; i++ ) {
            norm = Math.max( norm, this.__getColumn( i, true ).pnorm( 1 ) );
        }

        return norm;
    };

    /**
     * Get the diagonal of the matrix.
     * @param {number} [k=0] Specified which diagonal to return, i.e. 1 for the first upper secondary diagonal.
     * @returns {Array.<number>}
     */
    Matrix.prototype.diag = function (k) {
        k = getNumberWithDefault( k, 0 );

        var diag = [],
            rowOffset = -Math.min( k, 0 ),
            columnOffset = Math.max( k, 0 ),
            endOfLoop = (rowOffset === 0 ) ? (this.columns() - columnOffset) : (this.rows() - rowOffset);

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
     */
    Matrix.prototype.isInRange = function (row, column) {
        return (!isNumber( row ) || ( row >= 1 && row <= this.rows() ) )
            && (!isNumber( column ) || ( column >= 1 && column <= this.columns() ) );
    };

    /**
     * Convert matrix to array.
     * The array will contain the matrix's elements read from left to right, top to bottom
     * @returns {Array.<number>}
     */
    Matrix.prototype.toArray = function () {
        return [].slice.call( this.___getElements() );
    };

    /**
     * Returns a matrix of zeros.
     * If called with only one argument n, it will return a n-by-n matrix with zeros.
     * @param {number} rows Number of rows
     * @param {number} [columns=rows] Number of columns (defaults to the value of rows)
     * @returns {Matrix} A new matrix of the specified size containing zeros everywhere.
     * @static
     */
    Matrix.zeros = function (rows, columns) {
        columns = getNumberWithDefault( columns, rows );

        return new Matrix( rows, columns );
    };

    /**
     * Returns a matrix of ones.
     * @param {number} rows Number of rows
     * @param {number} [columns=rows] Number of columns
     * @returns {Matrix} A new matrix of the specified size containing ones everywhere.
     * @static
     */
    Matrix.ones = function (rows, columns) {
        columns = getNumberWithDefault( columns, rows );
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
     */
    Matrix.diag = function (entries, k) {
        entries = MatrixUtils.toArray( entries );
        k = getNumberWithDefault( k, 0 );

        var Result = new Matrix( entries.length + Math.abs( k ) ),
            rowOffset = -Math.min( k, 0 ),
            columnOffset = Math.max( k, 0 ),
            endOfLoop = ( Result.rows() - Math.abs( k ) );

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
     */
    Matrix.random = function (rows, columns, minVal, maxVal, onlyInteger) {
        columns = getNumberWithDefault( columns, rows );
        minVal = getNumberWithDefault( minVal, Matrix.options.random.minVal );
        maxVal = getNumberWithDefault( maxVal, Matrix.options.random.maxVal );
        onlyInteger = getBooleanWithDefault( onlyInteger, Matrix.options.random.onlyInteger );

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

    /**
     * Generate an array with linearly increasing numbers
     * @param {number} start Number to start with
     * @param {number} end Number to end with
     * @param {number} [step=1] Step in between numbers
     * @returns {Array.<number>}
     * @static
     */
    MatrixUtils.linspace = function (start, end, step) {
        step = getNumberWithDefault( step, 1 );
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
     */
    MatrixUtils.repeat = function (times, value) {
        var result = [];
        for( var i = 1; i <= times; i++ ) {
            result[i - 1] = value;
        }

        return result;
    };

    /**
     * @param {(Matrix|Array.<number>)} obj
     * @returns {Array.<number>}
     * @static
     */
    MatrixUtils.toArray = function (obj) {
        if( obj instanceof Array ) {
            return obj;
        }

        if( !obj.isVector() ) {
            throw new MatrixError( MatrixError.ErrorCodes.DIMENSION_MISMATCH, 'Argument has to be vector' );
        }

        var temp_obj = obj.copy();
        if( obj.dim( 'max' ) !== obj.rows() ) {
            temp_obj = temp_obj.transpose();
        }

        var result = [],
            rows = temp_obj.rows();

        for( var i = 1; i <= rows; i++ ) {
            result.push( temp_obj.___get( i, 1 ) );
        }

        return result;
    };

    /**
     * Predefined filters that can be used with methods like {@link Matrix.apply}.
     * These functions can take up to three arguments (value, row index, column index).
     * @static
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

    /**
     * Convert array to matrix.
     * This method simply calls the {@link Matrix} constructor.
     * @param {number} [rows] Number of rows
     * @param {number} [columns] Number of columns
     * @returns {Matrix}
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
     */
    Array.prototype.toVector = function (isRowVector) {
        // TODO: Return vector instance instead of Matrix

        isRowVector = getBooleanWithDefault( isRowVector, false );

        // TODO use vectors
        return new Matrix( this, (isRowVector) ? 1 : this.length, (isRowVector) ? this.length : 1 );
    };

    /**
     * Convert string to matrix.
     * @param {string} [rowSeparator='\r\n'] Row separator
     * @param {string} [columnSeparator='\t'] Column separator
     * @returns {Matrix}
     */
    String.prototype.toMatrix = function (rowSeparator, columnSeparator) {
        // TODO: add flag to define matrix type and adjust documentation accordingly

        rowSeparator = getStringWithDefault( rowSeparator, '\r\n' );
        columnSeparator = getStringWithDefault( columnSeparator, '\t' );

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

    window.Matrix = Matrix;
    window.SparseMatrix = SparseMatrix;
    window.Vector = Vector;
    window.MatrixUtils = MatrixUtils;
})( window );