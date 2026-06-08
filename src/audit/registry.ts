import { AuditModule } from './types';

export class AuditRegistry {
  private modules = new Map<string, AuditModule>();

  register(module: AuditModule): this {
    if (this.modules.has(module.id)) {
      throw new Error(`Audit module already registered: ${module.id}`);
    }
    this.modules.set(module.id, module);
    return this;
  }

  list(): AuditModule[] {
    return [...this.modules.values()];
  }

  enabled(ids?: string[]): AuditModule[] {
    if (ids?.length) {
      return ids.map((id) => {
        const module = this.modules.get(id);
        if (!module) throw new Error(`Unknown audit module: ${id}`);
        return module;
      });
    }
    return this.list().filter((module) => module.enabledByDefault !== false);
  }
}
