import { Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { typeEnum as tiposParticipante } from '../../domain/services/participante/typeEnum';
import { rolesEnum } from '../../domain/services/auth/rolesEnum';
import { KeycloakUserRepresentation } from './AuthTypes';

interface Auth {
  generateToken(body: any): any;
  refreshToken(refreshToken: any): any;

  /**
   * Informa se a requisição (req) foi feita por um dos participantes em (tipos).
   */
  isParticipante: (req: Request, ...tipos: tiposParticipante[]) => boolean;

  /**
   * Middleware que valida a requisição (req).
   *
   * Se feita por um dos participantes em (tipos), será chamado o pŕoximo middleware (next).
   * Se não feita por um dos participantes em (tipos), irá estourar uma exception de Acesso Negado.
   */
  requireParticipante: (...tipos: tiposParticipante[]) => (req: Request, res: Response, next: NextFunction) => any;

  generateSessionToken: any;

  /**
   * Retorna um array com as roles do usuário que fez a requisição (req).
   */
  getUserRoles: (req: Request) => rolesEnum[];

  /**
   * Retorna se o usuário que fez a requisição (req) possui alguma das roles exigidas para acesso (accessRoles).
   *
   * Se o usuário da requisição (req) tiver a role "super" o método sempre retornará true.
   */
  hasPermission: (req: Request, ...accessRoles: rolesEnum[]) => boolean;

  changeUserRoles: any;
  getRolesIds: any;
  authenticate: any;
  require: Function;
  inviteUser: (convite: any, transaction?: any) => any;
  createUser: any;
  updateUserData: any;

  /**
   * Encontra o usuário com identificador (userId) no keycloak e atualiza
   * a propriedade (enabled) para o valor informado em (userStatus: boolean)
   */
  updateUserStatus: (userId: string, userStatus: boolean) => Promise<void>;

  changeUserPassword: any;
  recoverPassword: any;
  authenticateAsAdmin: () => Promise<any>;

  /**
   * Retorna os dados do Keycloak referentes ao usuário identificado por (userId)
   * Os dados retornados estão mapeados na interface (KeycloakUserRepresentation)
   */
  getUser: (userId: string) => Promise<KeycloakUserRepresentation>;

  /**
   * Atualiza todos os dados no Keycloak.
   * Os dados devem estar correspondentes à interface (KeycloakUserRepresentation)
   * que é retornada no método auth.getUser(userId)
   */
  putUser: (user: KeycloakUserRepresentation) => Promise<void>;
}

export default Auth;
