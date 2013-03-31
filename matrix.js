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
    return this.dim( 1 ) === this.dim( 2 );
};

/**
 * Return a copy of the matrix. This prevents accidental usage of references.
 * @returns {Matrix}
 */
Matrix.prototype.copy = function () {
    return new Matrix( this.__getElements(), this.dim( 1 ), this.dim( 2 ) );
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
        throw new TypeError( 'Dimensions do not match.' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) ),
        elementsResult = [],
        current;

    for( var i = 1; i <= this.length(); i++ ) {
        if( this.get( i ) !== 0 && M.get( i ) !== 0 ) {
            current = this.get( i ) + M.get( i );

            if( current !== 0 ) {
                elementsResult[i - 1] = current;
            }
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

        return this.subtract.apply( Object( this.subtract( args.shift() ) ), Object( args ) );
    }

    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        throw new TypeError( 'Dimensions do not match.' );
    }

    var Result = new Matrix( this.dim( 1 ), this.dim( 2 ) ),
        elementsResult = [],
        current;

    for( var i = 1; i <= this.length(); i++ ) {
        if( this.get( i ) !== 0 && M.get( i ) !== 0 ) {
            current = this.get( i ) - M.get( i );

            if( current !== 0 ) {
                elementsResult[i - 1] = current;
            }
        }
    }

    Result.__setElements( elementsResult );

    return Result;
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
        throw new TypeError( 'Matrix is not square.' );
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
    var m = this.dim( 1 ),
        n = this.dim( 2 ),
        swappedRows = 0,
        LU = this.copy();

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
 * Calculate the determinant.
 * @returns {Number}
 */
Matrix.prototype.det = function () {
    /* TODO Ideas:
     *   1. Sparse matrix: Use Laplace?
     *   2. If triangular -> product of diagonal
     *   3. Direct calculation for up to 3x3 or similar
     */

    if( !this.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var n = this.dim( 1 ),
        LU = this.LUDecomposition();

    var det = Math.pow( -1, LU.swappedRows );
    for( var i = 1; i <= n; i++ ) {
        det = det * LU.get( i, i );
    }

    return det;
};

/**
 * Calculate the inverse matrix.
 * @returns {Matrix}
 */
Matrix.prototype.inverse = function () {
    if( !this.isSquare() ) {
        throw new TypeError( 'Matrix is not square.' );
    }

    var augmentedM = this.augment( Matrix.eye( this.dim( 1 ) ) ),
        row, i, j, k;

    try {
        augmentedM = augmentedM.LUDecomposition();

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

    return augmentedM.submatrix( 1, augmentedM.dim( 1 ), this.dim( 2 ) + 1, augmentedM.dim( 2 ) );
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
    var m = this.dim( 1 ),
        n = this.dim( 2 );

    if( rowStart < 1 || rowStart > m || columnStart < 1 || columnStart > n
        || rowEnd < 1 || rowEnd > m || columnEnd < 1 || columnEnd > n
        || rowStart > rowEnd || columnStart > columnEnd ) {
        throw new TypeError( 'Invalid parameters.' );
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
        throw new TypeError( 'Matrices do not have the same number of rows.' );
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
    digits = digits || 0;

    var Result = this.copy(),
        elements = Result.__getElements(),
        power = Math.pow( 10, digits );

    for( var i = 0; i < elements.length; i++ ) {
        if( elements[i] ) {
            elements[i] = Math.round( elements[i] * power ) / power;
        }
    }

    Result.__setElements( elements );
    return Result;
};

/**
 * Pointwise absolute value of the matrix.
 * @returns {Matrix} Matrix M with M(i,j) = abs( this(i,j) ) for all i,j.
 */
Matrix.prototype.abs = function () {
    var elements = this.__getElements();

    for( var i = 0; i < this.length(); i++ ) {
        if( elements[i] ) {
            elements[i] = Math.abs( elements[i] );
        }
    }

    return new Matrix( elements, this.dim( 1 ), this.dim( 2 ) );
};

/**
 * Returns the cross product. It doesn't matter whether the vectors are row or column vectors.
 * The resulting vector will always be a column vector.
 * @param {Matrix} M Three-dimensional vector
 * @returns {Matrix} The three-dimensional vector V = A x M.
 */
Matrix.prototype.cross = function (M) {
    if( !this.isVector() || !M.isVector() || this.dim( 'max' ) !== 3 || M.dim( 'max' ) !== 3 ) {
        throw new TypeError( 'Parameters are not three-dimensional vectors.' );
    }

    return new Matrix( [
        [this.get( 2 ) * M.get( 3 ) - this.get( 3 ) * M.get( 2 )],
        [this.get( 3 ) * M.get( 1 ) - this.get( 1 ) * M.get( 3 )],
        [this.get( 1 ) * M.get( 2 ) - this.get( 2 ) * M.get( 1 )]
    ] );
};

/**
 * Add a row to the matrix.
 * @param {Number[]|Matrix} elements Array or matrix of entries to add
 * @returns {Matrix}
 */
Matrix.prototype.addRow = function (elements) {
    elements = Matrix.__getArrayOrElements( elements );

    var Result = new Matrix( this.dim( 1 ) + 1, this.dim( 2 ) ),
        __elements = this.__getElements(),
        oldLength = __elements.length;

    for( var i = 0; i < Result.dim( 2 ); i++ ) {
        __elements[oldLength + i] = elements[i];
    }

    Result.__setElements( __elements );
    return Result;
};

/**
 * Add a column to the matrix.
 * @param {Number[]|Matrix} elements Array or matrix of entries to add
 * @returns {Matrix}
 */
Matrix.prototype.addColumn = function (elements) {
    elements = Matrix.__getArrayOrElements( elements );

    return this.copy().augment( new Matrix( elements, null, 1 ) );
};

/**
 * Check if the matrix contains a certain value.
 * @param {Number} needle Value to look for
 * @param {Number} [precision=0] Match if any value is in [needle-precision, needle+precision]
 * @returns {Boolean}
 */
Matrix.prototype.contains = function (needle, precision) {
    precision = precision || 0;

    if( !Matrix.__isNumber( needle ) || !Matrix.__isNumber( precision ) ) {
        throw new TypeError( 'Parameter is not a number.' );
    }

    if( needle !== 0 && precision === 0 ) {
        return this.__getElements().indexOf( needle ) !== -1;
    } else {
        for( var i = 1; i <= this.length(); i++ ) {
            if( Math.abs( this.get( i ) - needle ) <= precision ) {
                return true;
            }
        }

        return false;
    }
};

/**
 * Create a string representation of the matrix.
 * @param {String} [rowSeparator='\r\n'] Delimiter between columns
 * @param {String} [columnSeparator='\t'] Delimiter between the last column of the previous and first column of the
 * next row
 * @returns {String}
 * @override
 */
Matrix.prototype.toString = function (rowSeparator, columnSeparator) {
    // TODO move from concatenation to join
    rowSeparator = rowSeparator || '\r\n';
    columnSeparator = columnSeparator || '\t';

    var str = '';
    for( var i = 1; i <= this.dim( 1 ); i++ ) {
        for( var j = 1; j <= this.dim( 2 ); j++ ) {
            str += this.get( i, j );

            if( j !== this.dim( 2 ) ) {
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
 * Compare with another matrix.
 * @param {Matrix} M Matrix
 * @returns {boolean} True if A = M, false otherwise.
 */
Matrix.prototype.equals = function (M) {
    if( this.dim( 1 ) !== M.dim( 1 ) || this.dim( 2 ) !== M.dim( 2 ) ) {
        return false;
    }

    for( var i = 1; i <= this.length(); i++ ) {
        if( this.get( i ) !== M.get( i ) ) {
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
        throw new TypeError( 'Applicator has to be a function.' );
    }

    if( typeof filter !== 'function' ) {
        throw new TypeError( 'Filter has to be a function.' );
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