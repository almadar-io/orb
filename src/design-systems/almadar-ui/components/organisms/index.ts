// Shared organism types — base props contract for all entity-display organisms
export {
  type EntityDisplayProps,
  EntityDisplayEvents,
  type SortPayload,
  type PaginatePayload,
  type SearchPayload,
  type FilterPayload,
  type SelectPayload,
} from "./types";

// Shell organisms - common UI patterns
export {
  DataTable,
  type DataTableProps,
  type Column,
  type RowAction,
} from "./DataTable";
export { StatCard, type StatCardProps } from "./StatCard";
export {
  PageHeader,
  type PageHeaderProps,
  type PageBreadcrumb,
} from "./PageHeader";
export {
  DetailPanel,
  type DetailPanelProps,
  type DetailField,
  type DetailSection,
} from "./DetailPanel";
export {
  FormSection,
  FormLayout,
  FormActions,
  type FormSectionProps,
  type FormLayoutProps,
  type FormActionsProps,
} from "./FormSection";

// Migrated organisms
export { Form, type FormProps } from "./Form";
export { Header, type HeaderProps } from "./Header";
export {
  Navigation,
  type NavigationProps,
  type NavigationItem,
} from "./Navigation";
export { Section, type SectionProps } from "./Section";
export { Sidebar, type SidebarProps, type SidebarItem } from "./Sidebar";
export { Split, type SplitProps } from "./Split";
export {
  Table,
  type TableProps,
  type TableColumn,
  type SortDirection,
} from "./Table";
export { List, type ListProps, type ListItem } from "./List";
export { CardGrid, type CardGridProps, type CardGridGap } from "./CardGrid";
export { MasterDetail, type MasterDetailProps } from "./MasterDetail";

// Dialog organisms
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
} from "./ConfirmDialog";
export {
  WizardContainer,
  type WizardContainerProps,
  type WizardStep,
} from "./WizardContainer";

// Orbital visualization
export {
  OrbitalVisualization,
  type OrbitalVisualizationProps,
} from "./OrbitalVisualization";

// State machine visualization
export {
  StateMachineView,
  DomStateMachineVisualizer,
  OrbitalStateMachineView,
  type StateMachineViewProps,
  type TransitionBundle,
} from "./StateMachineView";

// Jazari state machine visualization
export {
  JazariStateMachine,
  type JazariStateMachineProps,
} from "./JazariStateMachine";

// Content rendering
export {
  ContentRenderer,
  type ContentRendererProps,
} from "./ContentRenderer";

// Book viewer
export * from "./book";

// Layout organisms
export * from "./layout";

// Game organisms
export * from "./game";

// UI Slot system
export {
  UISlotRenderer,
  UISlotComponent,
  SlotContentRenderer,
  type UISlotRendererProps,
} from "./UISlotRenderer";
export { ModalSlot, type ModalSlotProps } from "./ModalSlot";
export { DrawerSlot, type DrawerSlotProps } from "./DrawerSlot";
export { ToastSlot, type ToastSlotProps } from "./ToastSlot";

// Phase 7b - New core pattern organisms
export {
  Chart,
  type ChartProps,
  type ChartType,
  type ChartDataPoint,
  type ChartSeries,
} from "./Chart";
export {
  Meter,
  type MeterProps,
  type MeterVariant,
  type MeterThreshold,
} from "./Meter";
export {
  Timeline,
  type TimelineProps,
  type TimelineItem,
  type TimelineItemStatus,
} from "./Timeline";
export {
  MediaGallery,
  type MediaGalleryProps,
  type MediaItem,
} from "./MediaGallery";
export {
  SignaturePad,
  type SignaturePadProps,
} from "./SignaturePad";
export {
  DocumentViewer,
  type DocumentViewerProps,
  type DocumentType,
} from "./DocumentViewer";
export {
  GraphCanvas,
  type GraphCanvasProps,
  type GraphNode,
  type GraphEdge,
} from "./GraphCanvas";
export {
  CodeViewer,
  type CodeViewerProps,
  type CodeViewerMode,
  type DiffLine,
} from "./CodeViewer";
