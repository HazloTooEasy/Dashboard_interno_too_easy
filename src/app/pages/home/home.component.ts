import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 pb-12">
      <!-- Header -->
      <div class="flex items-end justify-between">
        <div>
          <h1 class="text-3xl font-display font-bold text-gray-900 tracking-tight">{{ greeting }}, {{ userName }}</h1>
          <p class="text-gray-500 mt-1">Aquí tienes el resumen de tu workspace en tiempo real.</p>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm" (click)="loadData()">
            <mat-icon class="!w-4 !h-4 !text-[16px] inline-block align-middle mr-1 -mt-0.5">refresh</mat-icon> Actualizar
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis; track kpi.label) {
          <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-500">{{ kpi.label }}</span>
              <div class="p-2 rounded-lg" [class]="kpi.colorClass">
                <mat-icon class="!w-5 !h-5 !text-[20px]">{{ kpi.icon }}</mat-icon>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-gray-900">{{ kpi.value }}</span>
              <span class="text-xs font-medium" [class]="kpi.trend > 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
              </span>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column (2/3) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Pipeline Resumido -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Pipeline Comercial</h2>
              <button class="text-sm text-brand-600 font-medium hover:text-brand-700">Ver CRM</button>
            </div>
            <div class="p-6">
              <div class="flex gap-2 h-12 rounded-lg overflow-hidden mb-6">
                <!-- Data dynamically loaded from database -->
                @for (stage of pipelineStages; track stage.name) {
                  @if (stage.percentage > 0) {
                    <div [class]="stage.bgClass + ' flex items-center justify-center text-xs font-medium ' + stage.textClass" 
                         [style.width.%]="stage.percentage" 
                         [title]="stage.name + ' (' + stage.count + ')'">
                      {{ stage.count > 0 ? stage.count : '' }}
                    </div>
                  }
                }
              </div>
              <div class="flex justify-between text-sm text-gray-500">
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-400"></span> Nuevos</div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Contactados</div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Reunión</div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-brand-400"></span> Propuesta</div>
                <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Negociación</div>
              </div>
            </div>
          </div>

          <!-- Tareas de hoy & Proyectos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Tareas -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Tareas de Hoy</h2>
                <span class="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">{{ tasks.length }} pendientes</span>
              </div>
              <div class="p-0 flex-1">
                @if (tasks.length === 0) {
                  <div class="p-6 text-center text-gray-500 text-sm">No hay tareas para hoy.</div>
                }
                <ul class="divide-y divide-gray-100">
                  @for (task of tasks; track task.id) {
                    <li class="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3 group cursor-pointer">
                      <button class="mt-0.5 text-gray-300 hover:text-brand-500 transition-colors">
                        <mat-icon class="!w-5 !h-5 !text-[20px]">radio_button_unchecked</mat-icon>
                      </button>
                      <div>
                        <p class="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">{{ task.title }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ task.project }} • {{ task.time }}</p>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Proyectos Activos -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Proyectos Activos</h2>
                <button class="text-sm text-brand-600 font-medium hover:text-brand-700">Ver todos</button>
              </div>
              <div class="p-0 flex-1">
                @if (projects.length === 0) {
                  <div class="p-6 text-center text-gray-500 text-sm">No hay proyectos activos.</div>
                }
                <ul class="divide-y divide-gray-100">
                  @for (project of projects; track project.id) {
                    <li class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ project.name }}</p>
                          <p class="text-xs text-gray-500">{{ project.client }}</p>
                        </div>
                        <span class="text-xs font-medium text-gray-500">{{ project.progress }}%</span>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="bg-brand-500 h-1.5 rounded-full" [style.width]="project.progress + '%'"></div>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column (1/3) -->
        <div class="space-y-8">
          
          <!-- Próximas Reuniones -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Próximas Reuniones</h2>
            </div>
            <div class="p-6 space-y-6">
              @if (meetings.length === 0) {
                <div class="text-center text-gray-500 text-sm">No hay reuniones próximas.</div>
              }
              @for (meeting of meetings; track meeting.id) {
                <div class="flex gap-4">
                  <div class="flex flex-col items-center min-w-[48px]">
                    <span class="text-xs font-semibold text-gray-500 uppercase">{{ meeting.month }}</span>
                    <span class="text-xl font-bold text-gray-900">{{ meeting.day }}</span>
                  </div>
                  <div class="flex-1 border-l-2 border-brand-200 pl-4 py-1">
                    <p class="text-sm font-medium text-gray-900">{{ meeting.title }}</p>
                    <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">schedule</mat-icon>
                      {{ meeting.time }}
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <div class="flex -space-x-2">
                        @for (avatar of meeting.avatars; track avatar) {
                          <img [src]="avatar" class="w-6 h-6 rounded-full border-2 border-white" alt="Attendee" referrerpolicy="no-referrer" />
                        }
                      </div>
                      <span class="text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <mat-icon class="!w-3 !h-3 !text-[12px]">videocam</mat-icon> Meet
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div class="p-6">
              <div class="relative border-l border-gray-200 ml-3 space-y-6">
                @if (activities.length === 0) {
                  <div class="text-center text-gray-500 text-sm ml-2">No hay actividad reciente.</div>
                }
                @for (activity of activities; track activity.id) {
                  <div class="relative pl-6">
                    <span class="absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white" [class]="activity.colorClass"></span>
                    <p class="text-sm text-gray-900">
                      <span class="font-medium">{{ activity.user }}</span> {{ activity.action }} <span class="font-medium">{{ activity.target }}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  kpis: any[] = [
    { label: 'Ingresos Estimados', value: '...', trend: 0, icon: 'payments', colorClass: 'bg-emerald-100 text-emerald-600' },
    { label: 'Nuevos Leads', value: '...', trend: 0, icon: 'person_add', colorClass: 'bg-blue-100 text-blue-600' },
    { label: 'Proyectos Activos', value: '...', trend: 0, icon: 'folder_open', colorClass: 'bg-purple-100 text-purple-600' },
    { label: 'Tareas Completadas', value: '...', trend: 0, icon: 'task_alt', colorClass: 'bg-brand-100 text-brand-600' },
  ];

  pipelineStages = [
    { name: 'Nuevos', count: 0, percentage: 20, bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
    { name: 'Contactados', count: 0, percentage: 20, bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
    { name: 'Reunión', count: 0, percentage: 20, bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
    { name: 'Propuesta', count: 0, percentage: 20, bgClass: 'bg-brand-100', textClass: 'text-brand-700' },
    { name: 'Negociación', count: 0, percentage: 20, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' }
  ];

  userName = 'Workspace';
  greeting = 'Hola';

  tasks: any[] = [];
  projects: any[] = [];
  meetings: any[] = [];
  activities: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) this.greeting = 'Buenos días';
    else if (hour >= 14 && hour < 21) this.greeting = 'Buenas tardes';
    else this.greeting = 'Buenas noches';
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const [profile, projects, tasks, meetings, activities, stats] = await Promise.all([
        this.supabase.getMyProfile(),
        this.supabase.getActiveProjects(),
        this.supabase.getTodayTasks(),
        this.supabase.getUpcomingMeetings(),
        this.supabase.getRecentActivity(),
        this.supabase.getReportStats() // Carga los KPIs reales de la base de datos
      ]);

      if (profile?.full_name) {
        // Show first name only for a friendlier greeting
        this.userName = profile.full_name.split(' ')[0];
      }
      this.projects = projects;
      this.tasks = tasks;
      this.meetings = meetings;
      this.activities = activities;

      // Calcular KPIs a partir de datos reales
      const totalIngresos = stats.leads?.reduce((acc: number, l: any) => acc + (Number(l.estimated_value) || 0), 0) || 0;
      const nuevosLeads = stats.leads?.filter((l: any) => l.status === 'new').length || 0;
      const proyectosActivos = stats.projects?.filter((p: any) => ['in_progress', 'planning', 'briefing', 'review'].includes(p.status)).length || 0;
      const tareasCompletadas = stats.tasks?.filter((t: any) => t.status === 'completed').length || 0;

      this.kpis = [
        { label: 'Ingresos Estimados', value: `€${totalIngresos.toLocaleString('es-ES')}`, trend: 0, icon: 'payments', colorClass: 'bg-emerald-100 text-emerald-600' },
        { label: 'Nuevos Leads', value: nuevosLeads.toString(), trend: 0, icon: 'person_add', colorClass: 'bg-blue-100 text-blue-600' },
        { label: 'Proyectos Activos', value: proyectosActivos.toString(), trend: 0, icon: 'folder_open', colorClass: 'bg-purple-100 text-purple-600' },
        { label: 'Tareas Completadas', value: tareasCompletadas.toString(), trend: 0, icon: 'task_alt', colorClass: 'bg-brand-100 text-brand-600' },
      ];

      // Configurar datos para el Pipeline del CRM
      if (stats.leads) {
        // Mapa estándar de estados a índice
        const pipelineStatusMap: Record<string, number> = {
            'new': 0, 'contacted': 1, 'meeting': 2, 'proposal': 3, 'negotiation': 4
        };
        const counts = [0, 0, 0, 0, 0];
        let totalLeads = 0;

        stats.leads.forEach((l: any) => {
            const idx = pipelineStatusMap[l.status];
            if (idx !== undefined) {
                counts[idx]++;
                totalLeads++;
            }
        });

        // Actualiza el array de pipelineStages solo si hay al menos un lead (para evitar división por 0)
        if (totalLeads > 0) {
            this.pipelineStages.forEach((stage, idx) => {
                stage.count = counts[idx];
                stage.percentage = (counts[idx] / totalLeads) * 100;
            });
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }
}

