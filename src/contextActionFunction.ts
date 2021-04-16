export type contextActionFunction<C, A, EC> = (context: C, action: A, executionContext: EC) => void
