import type { ServiceModule } from "@/types";
import { httpModule } from "./http";
import { smbModule } from "./smb";
import { sshModule, ftpModule, dnsModule } from "./network";
import { ldapModule, rdpModule, winrmModule } from "./windows-remote";
import { mysqlModule, mssqlModule } from "./databases";

export const SERVICE_MODULES: ServiceModule[] = [
  httpModule,
  smbModule,
  sshModule,
  ftpModule,
  dnsModule,
  ldapModule,
  rdpModule,
  winrmModule,
  mysqlModule,
  mssqlModule,
];

export const SERVICE_MAP: Record<string, ServiceModule> = Object.fromEntries(
  SERVICE_MODULES.map((m) => [m.id, m])
);

export function getServiceModule(id: string): ServiceModule | undefined {
  return SERVICE_MAP[id];
}

/** Find the service module that owns a given port. */
export function serviceModuleForPort(port: number): ServiceModule | undefined {
  return SERVICE_MODULES.find((m) => m.ports.includes(port));
}
