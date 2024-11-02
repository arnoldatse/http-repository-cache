import DefaultHttpExceptionType from "./DefaultHttpExceptionType";

/**
 * Represents an HTTP exception.
 *
 * @template T - The type of the additional possible exception type.
 * @template B - The type of the body of the exception.
 */
export default interface HttpException<T = unknown, B = unknown> {
    type: DefaultHttpExceptionType | T;
    body?: B;
}