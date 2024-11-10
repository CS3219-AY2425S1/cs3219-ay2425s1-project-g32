import { type FC } from 'react';

interface Props {
  height?: string;
  width?: string;
}

const BlockSpinning: FC<Props> = ({ height = '200px', width = '200px' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{
        margin: 'auto',
        background: 'transparent',
        display: 'block',
        shapeRendering: 'auto',
      }}
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <rect x="19" y="19" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0s"
          calcMode="discrete"
        />
      </rect>
      <rect x="40" y="19" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.125s"
          calcMode="discrete"
        />
      </rect>
      <rect x="61" y="19" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.25s"
          calcMode="discrete"
        />
      </rect>
      <rect x="19" y="40" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.875s"
          calcMode="discrete"
        />
      </rect>
      <rect x="61" y="40" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.375s"
          calcMode="discrete"
        />
      </rect>
      <rect x="19" y="61" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.75s"
          calcMode="discrete"
        />
      </rect>
      <rect x="40" y="61" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.625s"
          calcMode="discrete"
        />
      </rect>
      <rect x="61" y="61" width="20" height="20" fill="#e15b64">
        <animate
          attributeName="fill"
          values="#f8b26a;#e15b64;#e15b64"
          keyTimes="0;0.125;1"
          dur="1s"
          repeatCount="indefinite"
          begin="0.5s"
          calcMode="discrete"
        />
      </rect>
    </svg>
  );
};

export default BlockSpinning;
