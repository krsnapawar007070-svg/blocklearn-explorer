import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconLayoutDashboard(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </IconBase>
  );
}

export function IconBlocks(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="6" height="6" rx="0.8" />
      <rect x="14" y="4" width="6" height="6" rx="0.8" />
      <rect x="4" y="14" width="6" height="6" rx="0.8" />
      <rect x="14" y="14" width="6" height="6" rx="0.8" />
    </IconBase>
  );
}

export function IconArrowLeftRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 7 4 12l4 5" />
      <path d="M4 12h16" />
      <path d="m16 17 4-5-4-5" />
    </IconBase>
  );
}

export function IconPickaxe(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 9.5 18 6" />
      <path d="m12 12 7-7" />
      <path d="M8 8c-3 1-5 4-5 8" />
      <path d="M16 16c-4 0-7-2-8-5" />
      <path d="m5 19 7-7" />
    </IconBase>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 14h2" />
    </IconBase>
  );
}

export function IconFlask(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 2v7.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V2" />
      <path d="M8.5 2h7" />
      <path d="M7 14h10" />
    </IconBase>
  );
}

export function IconGraduation(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m22 10-10-5L2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5" />
    </IconBase>
  );
}

export function IconHash(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="m10 3-2 18" />
      <path d="m16 3-2 18" />
    </IconBase>
  );
}

export function IconLink(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 1 0 7.07 7.07L14 18.07" />
    </IconBase>
  );
}

export function IconClock(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconInbox(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 13h4l2 3h4l2-3h4" />
      <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7l-3 7H7l-3-7Z" />
    </IconBase>
  );
}

export function IconShieldCheck(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function IconShieldX(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9.5 9.5 5 5" />
      <path d="m14.5 9.5-5 5" />
    </IconBase>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </IconBase>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 12h-4l-3 7-6-14-3 7H2" />
    </IconBase>
  );
}

export function IconCpu(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </IconBase>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </IconBase>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <IconBase {...props}>
      <polyline points="20 6 9 17 4 12" />
    </IconBase>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </IconBase>
  );
}

export function IconClose(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}
