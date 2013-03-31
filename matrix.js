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
     * @see Matrix.cross
     */
    this.cross = function (M) {
        return Matrix.cross( this, M );
    };

    /**
     * @see Matrix.trace
     */
    this.trace = function () {
        return Matrix.trace( this );
    };

    /**
     * @see Matrix.transpose
     */
    this.transpose = function () {
        return Matrix.transpose( this );
    };

    /**
     * @see Matrix.det
     */
    this.det = function () {
        return Matrix.det( this );
    };

    /**
     * @see Matrix.inverse
     */
    this.inverse = function () {
        return Matrix.inverse( this );
    };

    /**
     * @see Matrix.augment
     */
    this.augment = function (M) {
        return Matrix.augment( this, M );
    };

    /**
     * @see Matrix.submatrix
     */
    this.submatrix = function (rowStart, rowEnd, columnStart, columnEnd) {
        return Matrix.submatrix( this, rowStart, rowEnd, columnStart, columnEnd );
    };

    /**
     * @see Matrix.abs
     */
    this.abs = function () {
        return Matrix.abs( this );
    };

    /**
     * @see Matrix.apply
     */
    this.apply = function (fun, filter) {
        return Matrix.apply( this, fun, filter );
    };

    /**
     * @see Matrix.nzapply
     */
    this.nzapply = function (fun) {
        return Matrix.nzapply( this, fun );
    };

    /**
     * @see Matrix.exp
     */
    this.exp = function () {
        return Matrix.exp( this );
    };

    /**
     * @see Matrix.pow
     */
    this.pow = function (n) {
        return Matrix.pow( this, n );
    };

    /**
     * @see Matrix.prototype.roundTo
     */
    this.round = function () {
        return this.roundTo( 0 );
    };

    /**
     * @see Matrix.roundTo
     */
    this.roundTo = function (precision) {
        return Matrix.roundTo( this, precision );
    };

    /**
     * @see Matrix.addRow
     */
    this.addRow = function (elements) {
        // TODO : allow specifying an index
        return Matrix.addRow( this, elements );
    };

    /**
     * @see Matrix.addColumn
     */
    this.addColumn = function (elements) {
        // TODO : allow specifying an index
        return Matrix.addColumn( this, elements );
    };

    /**
     * @see Matrix.isSquare
     */
    this.isSquare = function () {
        return Matrix.isSquare( this );
    };

    /**
     * @see Matrix.isVector
     */
    this.isVector = function () {
        return Matrix.isVector( this );
    };

    /**
     * @see Matrix.copy
     */
    this.copy = function () {
        return Matrix.copy( this );
    };

    /**
     * @see Matrix.contains
     */
    this.contains = function (needle, precision) {
        return Matrix.contains( this, needle, precision );
    };

    /**
     * @see Matrix.equals
     */
    this.equals = function (M) {
        return Matrix.equals( this, M );
    };

    /**
     * @see Matrix.toString
     */
    this.toString = function (rowSeparator, columnSeparator) {
        return Matrix.toString( this, rowSeparator, columnSeparator );
    };

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
    };

    /**
     * Get an element from the matrix.
     * If called with both arguments, the entry (row, column) will be returned. If called with only one argument,
     * that argument will be mapped linearly (left to right, top to bottom).
     * @param {Number} row Row index if column is set or linear index
     * @param {Number} [column] Column index
     * @returns {Number}
     */
    this.get = function (row, column) {
        if( typeof column === 'undefined' ) {
            var index = arguments[0];

            if( index < 1 || index > this.length() ) {
                throw new TypeError( 'Cannot access element at index ' + index );
            }

            return __elements[index - 1] || 0;
        } else {
            if( row < 1 || column < 1 || row > __rows || column > __columns ) {
                throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
            }

            return __elements[this.__convertToIndex( row, column )] || 0;
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
    this.set = function (row, column, value) {
        var index;

        if( typeof value === 'undefined' ) {
            index = row - 1;
            value = column;

            if( index < 0 || index >= this.length() ) {
                throw new TypeError( 'Cannot access element at index ' + index );
            }
        } else {
            if( row < 1 || column < 1 || row > __rows || column > __columns ) {
                throw new TypeError( 'Cannot access element (' + row + ',' + column + ')' );
            }

            index = this.__convertToIndex( row, column );
        }

        if( __elements[index] || value !== 0 ) {
            __elements[index] = value;
        }

        return this;
    };

    /**
     * Get a row from the matrix as an array.
     * @param {Number} row The row index of the row that shall be returned
     * @returns {Number[]} Array of the elements in the specified row.
     */
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
    };

    /**
     * Replace a row in the matrix with a new one.
     * @param {Number} row The row index of the row to replace
     * @param {Number[]|Matrix} elements An array or Matrix containing the new entries for the row
     * @returns {*}
     */
    this.setRow = function (row, elements) {
        elements = Matrix.__getArrayOrElements( elements );

        if( row < 1 || row > __rows ) {
            throw new TypeError( 'Invalid row index.' );
        }

        if( elements.length !== __columns ) {
            throw new TypeError( 'Wrong number of columns in row (found '
                + elements.length + ' but expected ' + __columns + ').' );
        }

        __elements.splice.apply( __elements, [this.__convertToIndex( row, 1 ), __columns].concat( elements ) );

        return this;
    };

    /**
     * Get a column from the matrix as an array.
     * @param {Number} column The column index of the column that shall be returned
     * @returns {Number[]} Array of the elements in the specified column.
     */
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
    };

    /**
     * Replace a column in the matrix with a new one.
     * @param {Number} column The column index of the column to replace
     * @param {Number[]|Matrix} elements An array or matrix containing the new entries for the column
     * @returns {*}
     */
    this.setColumn = function (column, elements) {
        elements = Matrix.__getArrayOrElements( elements );

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
    };

    /**
     * Returns the number of elements in the matrix.
     * @returns {number}
     * @override
     */
    this.length = function () {
        return __rows * __columns;
    };

    /**
     * Get the dimensions of the matrix.
     * @returns {{rows: Number, columns: Number}} Object containing the number of rows/columns in the matrix.
     */
    this.getDimensions = function () {
        return {
            rows: __rows,
            columns: __columns
        };
    };

    /**
     * Get the dimensions of the matrix.
     * Without any arguments, this is a short-hand notation for Matrix.prototype.getDimensions(). Other arguments are:<br />
     *  - 1 or 'rows' : Number of rows<br />
     *  - 2 or 'columns' : Number of columns<br />
     *  - 'max' : Dominant dimension<br />
     *  - 'min' : Smaller dimension
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
            } else if( requestedDim === 'max' ) {
                return Math.max( __rows, __columns );
            } else if( requestedDim === 'min' ) {
                return Math.min( __rows, __columns );
            }
        }

        throw new TypeError( 'Invalid parameter(s).' );
    };

    this.__convertToIndex = function (row, column) {
        return Matrix.__convertToIndex( this, row, column );
    };

    this.__getElements = function () {
        return [].slice.call( __elements );
    };

    this.__setElements = function (elements) {
        if( __elements.length !== 0 && __elements.length !== elements.length ) {
            throw new TypeError( 'Invalid number of elements. The size of a matrix cannot be changed afterwards.' );
        }

        __elements = elements;
        return this;
    };


    // Constructor
    (function () {
        if( args.length === 1 && args[0] instanceof Array && args[0].length !== 0 && args[0][0] instanceof Array ) {
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
        } else if( args.length >= 1 && args.length <= 3 && args[0] instanceof Array
            && ( args[0].length === 0 || (args[0].length !== 0 && Matrix.__isNumber( args[0][0] ) ) ) ) {

            __elements = args[0];
            var rows = args[1],
                columns = args[2];

            if( !rows && !columns ) {
                var dim = Math.sqrt( __elements.length );

                rows = dim;
                columns = dim;
            } else if( !rows && typeof Matrix.__isInteger( columns ) ) {
                rows = __elements.length / columns;
            } else if( typeof rows === 'number' && !columns ) {
                columns = __elements.length / rows;
            }

            if( !Matrix.__isInteger( rows ) || !Matrix.__isInteger( columns ) ) {
                throw new TypeError( 'Array has to represent a square matrix or the size has to be specified.' );
            }

            __rows = rows;
            __columns = columns;
        } else if( args.length === 1 && Matrix.__isInteger( args[0] ) ) {
            __rows = args[0];
            __columns = args[0];
        } else if( args.length === 2 && Matrix.__isInteger( args[0] ) && Matrix.__isInteger( args[1] ) ) {
            __rows = args[0];
            __columns = args[1];
        } else {
            throw new TypeError( 'Invalid parameters.' );
        }
    })();

    return this;
}

/**
 * Predefined filters that can be used with methods like {@link Matrix.apply}.
 * These functions can take up to three arguments (value, row index, column index).
 */
Matrix.filters = {
    all: function (value) {
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
 * @static
 * @private
 */
Matrix.__isNumber = function (k) {
    return typeof k === 'number';
};

/**
 * @static
 * @private
 */
Matrix.__isInteger = function (k) {
    return Matrix.__isNumber( k ) && (k | 0) === k;
};

/**
 * @static
 * @private
 */
Matrix.__isMatrix = function (obj) {
    return obj instanceof Matrix;
};

/**
 * @static
 * @private
 */
Matrix.__convertToIndex = function (M, row, column) {
    return M.dim( 2 ) * (row - 1) + column - 1;
};

/**
 * @static
 * @private
 */
Matrix.__getArrayOrElements = function (obj) {
    if( Matrix.__isMatrix( obj ) ) {
        return obj.__getElements();
    }

    return obj;
};

/**
 * Check if a matrix is a vector.
 * @param {Matrix} M Matrix
 * @returns {boolean} True if at least one dimension is 1.
 * @static
 */
Matrix.isVector = function (M) {
    return M.dim( 'min' ) === 1;
};

/**
 * Check if a matrix is a square matrix.
 * @param {Matrix} M Matrix
 * @returns {boolean} True if the number of rows and columns equal, false otherwise.
 * @static
 */
Matrix.isSquare = function (M) {
    return M.dim( 1 ) === M.dim( 2 );
};

/**
 * Return a copy of a matrix. This prevents accidental usage of references.
 * @param M
 * @returns {Matrix}
 * @static
 */
Matrix.copy = function (M) {
    return new Matrix( M.__getElements(), M.dim( 1 ), M.dim( 2 ) );
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

        return this.add.apply( this.add( args.shift() ), args );
    }

    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) ),
        elementsResult = [];

    for( var i = 1; i <= this.length(); i++ ) {
        if( this.get( i ) !== 0 && M.get( i ) !== 0 ) {
            elementsResult[i - 1] = this.get( i ) + M.get( i );
        }
    }

    Result.__setElements( elementsResult );

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

        return this.subtract.apply( this.subtract( args.shift() ), args );
    }

    return this.add( M.scale( -1 ) );
};

/**
 * Scale with a constant factor (i.e. calculate k * this)
 * @param {Number} k Factor
 * @returns {Matrix} Matrix with all entries multiplied by k.
 */
Matrix.prototype.scale = function (k) {
    if( !Matrix.__isNumber( k ) ) {
        throw new TypeError( 'Factor is not a number.' );
    }

    var __elements = this.__getElements();
    for( var i = 0; i < this.length(); i++ ) {
        if( __elements[i] ) {
            __elements[i] = k * __elements[i];
        }
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
        throw new TypeError( 'Inner dimensions do not match.' );
    }

    var Result = new Matrix( this.dim( 1 ), M.dim( 2 ) );
    for( var i = 1; i <= Result.dim( 1 ); i++ ) {
        for( var j = 1; j <= Result.dim( 2 ); j++ ) {
            var temp = 0;
            for( var k = 1; k <= this.dim( 2 ); k++ ) {
                temp += this.get( i, k ) * M.get( k, j );
            }

            Result.set( i, j, temp );
        }
    }

    return Result;
};

/**
 * Transpose a matrix, i.e. take the rows as the columns of the resulting matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Transposed matrix M^T.
 * @static
 */
Matrix.transpose = function (M) {
    var Result = new Matrix( M.dim( 2 ), M.dim( 1 ) );
    for( var i = 1; i <= M.dim( 1 ); i++ ) {
        Result.setColumn( i, M.getRow( i ) );
    }

    return Result;
};

/**
 * Calculate the trace of a matrix, i.e. the sum of all diagonal entries.
 * @param {Matrix} M Matrix
 * @returns {Number} Sum of diagonal entries.
 * @static
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
};

/**
 * Performs a LU decomposition. Both matrices will be written in the same matrix, i.e. the trivial
 * diagonal entries will not be stored.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix with the LU entries. There is also a hidden property swappedRows with the number
 * of rows that were swapped in the process.
 * @static
 */
Matrix.LUDecomposition = function (M) {
    var m = M.dim( 1 ),
        n = M.dim( 2 ),
        swappedRows = 0,
        LU = M.copy();

    var i, j, k;

    for( k = 1; k <= m; k++ ) {
        var pivot = 0,
            maxArg = -1;

        for( i = k; i <= m; i++ ) {
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

        for( i = k + 1; i <= m; i++ ) {
            for( j = k + 1; j <= n; j++ ) {
                LU.set( i, j, LU.get( i, j ) - LU.get( k, j ) * ( LU.get( i, k ) / LU.get( k, k ) ) );
            }

            LU.set( i, k, 0 );
        }
    }

    // as a "hidden property" we attach the number of swapped rows
    LU.swappedRows = swappedRows;

    return LU;
};

/**
 * Calculate the determinant of a Matrix.
 * @param {Matrix} M Matrix
 * @returns {Number} Determinant of M.
 * @static
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
};

/**
 * Calculate the inverse of a Matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Inverse of M, a.k.a. M^(-1).
 * @static
 */
Matrix.inverse = function (M) {
    if( !M.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var augmentedM = Matrix.augment( M, Matrix.eye( M.dim( 1 ) ) ),
        row, i, j, k;

    try {
        augmentedM = Matrix.LUDecomposition( augmentedM );

        // TODO The following two loops can probably be rewritten into something smarter
        for( i = augmentedM.dim( 1 ); i > 1; i-- ) {
            row = augmentedM.getRow( i );
            var factor = augmentedM.get( i - 1, i ) / augmentedM.get( i, i );

            for( k = 0; k < row.length; k++ ) {
                augmentedM.set( i - 1, k + 1, augmentedM.get( i - 1, k + 1 ) - (row[k] * factor ) );
            }
        }

        for( j = 1; j <= augmentedM.dim( 1 ); j++ ) {
            row = augmentedM.getRow( j );

            for( k = 0; k < row.length; k++ ) {
                row[k] = row[k] / augmentedM.get( j, j );
            }

            augmentedM.setRow( j, row );
        }
    } catch( e ) {
        throw new TypeError( 'Matrix is not invertible.' );
    }

    return Matrix.submatrix( augmentedM,
        1, augmentedM.dim( 1 ), M.dim( 2 ) + 1, augmentedM.dim( 2 ) );
};

/**
 * Extract a submatrix.
 * @param {Matrix} M Matrix
 * @param {Number} rowStart Row index where to start the cut
 * @param {Number} rowEnd Row index where to end the cut
 * @param {Number} columnStart Column index where to start the cut
 * @param {Number} columnEnd Column index where to end the cut
 * @returns {Matrix} Submatrix of M in the specified area.
 * @static
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
};

/**
 * Augment two matrices.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {Matrix} Augmented matrix A|B.
 * @static
 */
Matrix.augment = function (A, B) {
    if( A.dim( 1 ) !== B.dim( 1 ) ) {
        throw new TypeError( 'Matrices do not have the same number of rows.' );
    }

    var Result = new Matrix( A.dim( 1 ), A.dim( 2 ) + B.dim( 2 ) );

    for( var i = 1; i <= A.dim( 2 ); i++ ) {
        Result.setColumn( i, A.getColumn( i ) );
    }
    for( var j = 1; j <= B.dim( 2 ); j++ ) {
        Result.setColumn( j + A.dim( 2 ), B.getColumn( j ) );
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
        throw new TypeError( 'Parameter is not a vector.' );
    }

    var dimA = this.dim( 'max' ),
        dimB = M.dim( 'max' );

    if( dimA !== dimB ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var result = 0;
    for( var i = 1; i <= dimA; i++ ) {
        result += this.get( i ) * M.get( i );
    }

    return result;
};

/**
 * Rounds each element in a matrix with a specified precision.
 * @param {Matrix} M Matrix
 * @param {Number} [precision=0] Precision in digits after the comma
 * @returns {Matrix} Matrix with rounded entries.
 * @static
 */
Matrix.roundTo = function (M, precision) {
    precision = precision || 0;

    var Result = M.copy(),
        elements = Result.__getElements(),
        power = Math.pow( 10, precision );

    for( var i = 0; i < elements.length; i++ ) {
        if( elements[i] ) {
            elements[i] = Math.round( elements[i] * power ) / power;
        }
    }

    Result.__setElements( elements );

    return Result;
};

/**
 * Returns a matrix with the absolute values of each entry of a given matrix.
 * @param {Matrix} M Matrix
 * @returns {Matrix} Matrix N with N(i,j) = abs( M(i,j) ) for all i,j.
 * @static
 */
Matrix.abs = function (M) {
    var Result = M.copy(),
        elements = Result.__getElements();

    for( var i = 0; i < M.length(); i++ ) {
        if( elements[i] ) {
            elements[i] = Math.abs( elements[i] );
        }
    }

    Result.__setElements( elements );

    return Result;
};

/**
 * Returns the cross product of two vectors. It doesn't matter whether the vectors are row or column vectors.
 * The resulting vector will always be a column vector.
 * @param {Matrix} A Three-dimensional vector
 * @param {Matrix} B Three-dimensional vector
 * @returns {Matrix} The three-dimensional vector V = A x B.
 * @static
 */
Matrix.cross = function (A, B) {
    if( !A.isVector() || !B.isVector() || A.dim( 'max' ) !== 3 || B.dim( 'max' ) !== 3 ) {
        throw new TypeError( 'Parameters are not three-dimensional vectors.' );
    }

    return new Matrix( [
        [A.get( 2 ) * B.get( 3 ) - A.get( 3 ) * B.get( 2 )],
        [A.get( 3 ) * B.get( 1 ) - A.get( 1 ) * B.get( 3 )],
        [A.get( 1 ) * B.get( 2 ) - A.get( 2 ) * B.get( 1 )]
    ] );
};

/**
 * Add a row to an existing matrix.
 * @param {Matrix} M Matrix
 * @param {Number[]|Matrix} elements Array or matrix of entries to add
 * @returns {Matrix}
 * @static
 */
Matrix.addRow = function (M, elements) {
    elements = Matrix.__getArrayOrElements( elements );

    var Result = new Matrix( M.dim( 1 ) + 1, M.dim( 2 ) ),
        __elements = M.__getElements(),
        oldLength = __elements.length;

    for( var i = 0; i < Result.dim( 2 ); i++ ) {
        __elements[oldLength + i] = elements[i];
    }

    Result.__setElements( __elements );
    return Result;
};

/**
 * Add a column to an existing matrix.
 * @param {Matrix} M Matrix
 * @param {Number[]|Matrix} elements Array or matrix of entries to add
 * @returns {Matrix}
 * @static
 */
Matrix.addColumn = function (M, elements) {
    elements = Matrix.__getArrayOrElements( elements );

    return M.copy().augment( new Matrix( elements, null, 1 ) );
};

/**
 * Check if a matrix contains a certain value.
 * @param {Matrix} M Matrix
 * @param {Number} needle Value to look for
 * @param {Number} [precision=0] Match if any value is in [needle-precision, needle+precision]
 * @returns {Boolean} True if the needle could be found, false otherwise.
 * @static
 */
Matrix.contains = function (M, needle, precision) {
    precision = precision || 0;

    if( !Matrix.__isNumber( needle ) || !Matrix.__isNumber( precision ) ) {
        throw new TypeError( 'Parameter is not a number.' );
    }

    if( needle !== 0 && precision === 0 ) {
        return M.__getElements().indexOf( needle ) !== -1;
    } else {
        for( var i = 1; i <= M.length(); i++ ) {
            if( Math.abs( M.get( i ) - needle ) <= precision ) {
                return true;
            }
        }

        return false;
    }
};

/**
 * Create a string representation of a matrix.
 * @param {Matrix} M
 * @param {String} [rowSeparator='\r\n'] Delimiter between columns
 * @param {String} [columnSeparator='\t'] Delimiter between the last column of the previous and first column of the next row
 * @returns {string}
 * @static
 */
Matrix.toString = function (M, rowSeparator, columnSeparator) {
    // TODO move from concatenation to join
    rowSeparator = rowSeparator || '\r\n';
    columnSeparator = columnSeparator || '\t';

    var str = '';
    for( var i = 1; i <= M.dim( 1 ); i++ ) {
        for( var j = 1; j <= M.dim( 2 ); j++ ) {
            str += M.get( i, j );

            if( j !== M.dim( 2 ) ) {
                str += columnSeparator;
            }
        }

        if( i !== M.dim( 1 ) ) {
            str += rowSeparator;
        }
    }

    return str;
};

/**
 * Compare two matrices for equality.
 * @param {Matrix} A Matrix
 * @param {Matrix} B Matrix
 * @returns {boolean} True if A = B, false otherwise.
 * @static
 */
Matrix.equals = function (A, B) {
    if( A.dim( 1 ) !== B.dim( 1 ) || A.dim( 2 ) !== B.dim( 2 ) ) {
        return false;
    }

    for( var i = 1; i <= A.length(); i++ ) {
        if( A.get( i ) !== B.get( i ) ) {
            return false;
        }
    }

    return true;
};

/**
 * Apply a custom function to each entry.
 * @param {Matrix} M Matrix
 * @param {function} applicator Function to apply. It will be provided with three arguments (value, row index,
 * column index) and has to return the new value to write in the matrix. Predefined applicators can be found at
 * {@link Matrix.applicators}.
 * @param {function} [filter=Matrix.filters.all] A function that will be called with the same arguments as applicator.
 * If provided, applicator will only be applied if filter returns true. Predefined filters can be found at
 * {@link Matrix.filters}.
 * @returns {Matrix}
 * @static
 */
Matrix.apply = function (M, applicator, filter) {
    filter = filter || Matrix.filters.all;

    if( typeof applicator !== 'function' ) {
        throw new TypeError( 'Applicator has to be a function.' );
    }

    if( typeof filter !== 'function' ) {
        throw new TypeError( 'Filter has to be a function.' );
    }

    var Result = M.copy(),
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
 * @param {Matrix} M Matrix
 * @param {function} applicator Function to apply. It will be provided with three arguments (value, row index,
 * column index) and has to return the new value to write in the matrix. Predefined applicators can be found at
 * {@link Matrix.applicators}.
 * @returns {Matrix}
 * @static
 */
Matrix.nzapply = function (M, applicator) {
    return Matrix.apply( M, applicator, Matrix.filters.nonZero );
};

/**
 * Apply the exponential function to each entry.
 * @param {Matrix} M Matrix
 * @returns {Matrix}
 * @static
 */
Matrix.exp = function (M) {
    return Matrix.apply( M, Matrix.applicators.exp );
};

/**
 * Raise a matrix to the n-th power.
 * @param {Matrix} M Matrix
 * @param {Number} n Power
 * @returns {Matrix} The matrix M^n.
 */
Matrix.pow = function (M, n) {
    return Matrix.apply( M, function (value) {
        return Math.pow( value, n );
    } );
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
    if( !columns ) {
        columns = rows;
    }

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
    if( !columns ) {
        columns = rows;
    }

    var elements = [];
    for( var i = 0; i < rows * columns; i++ ) {
        elements[i] = 1;
    }

    return new Matrix( rows, columns ).__setElements( elements );
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
    k = k || 0;

    var Result = new Matrix( elements.length + Math.abs( k ) ),
        rowOffset = -Math.min( k, 0 ),
        columnOffset = Math.max( k, 0 );

    for( var i = 1; i <= ( Result.dim( 1 ) - Math.abs( k ) ); i++ ) {
        Result.set( i + rowOffset, i + columnOffset, elements[i - 1] );
    }

    return Result;
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
    isRowVector = isRowVector || false;

    return new Matrix( this, (isRowVector) ? 1 : this.length, (isRowVector) ? this.length : 1 );
};