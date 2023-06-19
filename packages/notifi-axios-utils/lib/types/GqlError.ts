const hasKey = <T, Key extends PropertyKey>(
  obj: T,
  prop: Key,
): obj is T & Record<Key, unknown> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
};

const packageErrors = (
  errors: ReadonlyArray<unknown>,
): ReadonlyArray<string> => {
  const messages: string[] = [];
  errors.forEach((error) => {
    if (hasKey(error, 'message') && typeof error.message === 'string') {
      messages.push(error.message);
    }
  });
  return messages;
};

/**
 * Represents an error that occurred during a GraphQL operation.
 * @class
 * @extends Error
 * @param {string} operationName - The name of the GraphQL operation that caused the error.
 * @param {ReadonlyArray<unknown>} errors - An array of errors that occurred during the operation.
 * @returns {GqlError} - A new instance of the GqlError class.
 * @remarks Use the getErrorMessages method to retrieve an array of error messages from the errors array.
 */
export default class GqlError extends Error {
  constructor(
    public operationName: string,
    public errors: ReadonlyArray<unknown>,
  ) {
    super(`GQL Errors occurred during ${operationName}`);
  }

  public getErrorMessages(): ReadonlyArray<string> {
    return packageErrors(this.errors);
  }
}
