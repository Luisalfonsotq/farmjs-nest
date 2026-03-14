import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import { FincaAccessGuard } from '../auth/guards/finca-access.guard';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('finca/:fincaId')
  @UseGuards(JwtAuthGuard, RolesGuard, FincaAccessGuard)
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SUPERVISOR) // Solo Administrador y Supervisor pueden ver la auditoría
  findAllByFinca(
    @Param('fincaId') fincaId: string,
    @Query() query: any,
  ) {
    return this.auditoriaService.findAllByFinca(+fincaId, query);
  }
}
