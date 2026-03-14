import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from '../auditoria.service';
import { AccionAuditoria } from '../entities/auditoria.entity';

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body, params, user, ip } = request;

    return next.handle().pipe(
      tap((data) => {
        // Ignorar GET por defecto para no saturar los logs, a menos que sea un reporte exportado
        if (method === 'GET' && !originalUrl.includes('exportar')) return;

        let accion = AccionAuditoria.UPDATE;
        if (method === 'POST') accion = AccionAuditoria.CREATE;
        if (method === 'DELETE') accion = AccionAuditoria.DELETE;
        if (originalUrl.includes('login')) accion = AccionAuditoria.LOGIN;
        if (originalUrl.includes('exportar')) accion = AccionAuditoria.EXPORT;

        // Inferir finca_id de las diferentes maneras que puede venir
        let finca_id = 
          body?.finca_id || 
          body?.fincaId || 
          params?.fincaId || 
          params?.finca_id || 
          data?.finca_id || 
          data?.finca?.id || 
          null;

        // Inferir entidad_id (generalmente el registro creado/actualizado, o el param id)
        let entidad_id = data?.id || params?.id || null;

        // Extraer el nombre de la entidad de la URL base
        let entidad = originalUrl.split('/')[1].split('?')[0]; 

        // Solo registramos si tenemos usuario y finca identificados (es a nivel de finca)
        if (user && user.id && finca_id) {
          let detalles = { ...body };
          if (detalles.password) delete detalles.password;
          
          this.auditoriaService.createLog(
            user.id,
            Number(finca_id),
            accion,
            entidad,
            entidad_id ? Number(entidad_id) : null,
            detalles,
            ip
          ).catch(err => console.error('Error logging auditoria:', err));
        }
      }),
    );
  }
}
