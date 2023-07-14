import { CwiError } from 'cwi-base'

export class ERR_HISTORIAN_INVALID_SIG extends CwiError { constructor(description?: string) { super('ERR_INVALID_SIGNATURE', description || 'Invalid Signature!') } }
export class ERR_HISTORIAN_INVALID_TOKEN extends CwiError { constructor(description?: string) { super('ERR_INVALID_TOKEN', description || 'Invalid token!') } }