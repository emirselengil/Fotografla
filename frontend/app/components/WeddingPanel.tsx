function Rose({
  cx, cy, size, c1, c2, c3, rot = 0,
}: {
  cx: number; cy: number; size: number;
  c1: string; c2: string; c3: string; rot?: number;
}) {
  const r1 = size * 0.44;
  const pw1 = size * 0.26; const ph1 = size * 0.2;
  const r2 = size * 0.25;
  const pw2 = size * 0.2;  const ph2 = size * 0.15;
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-r1} rx={pw1} ry={ph1}
          fill={c1} transform={`rotate(${a})`} opacity={0.9} />
      ))}
      {[36, 108, 180, 252, 324].map((a) => (
        <ellipse key={a} cx={0} cy={-r2} rx={pw2} ry={ph2}
          fill={c2} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={size * 0.13} fill={c3} />
    </g>
  );
}

function Leaf({ x, y, len, a, fill }: { x: number; y: number; len: number; a: number; fill: string }) {
  const w = len * 0.32;
  return (
    <path
      d={`M 0 0 C ${-w} ${-len * 0.35} ${-w * 0.7} ${-len * 0.75} 0 ${-len} C ${w * 0.7} ${-len * 0.75} ${w} ${-len * 0.35} 0 0 Z`}
      fill={fill}
      transform={`translate(${x},${y}) rotate(${a})`}
    />
  );
}

function GoldLeaf({ x, y, len, a }: { x: number; y: number; len: number; a: number }) {
  const w = len * 0.28;
  return (
    <path
      d={`M 0 0 C ${-w} ${-len * 0.35} ${-w * 0.6} ${-len * 0.75} 0 ${-len} C ${w * 0.6} ${-len * 0.75} ${w} ${-len * 0.35} 0 0 Z`}
      fill="none" stroke="#c4974a" strokeWidth="0.9"
      transform={`translate(${x},${y}) rotate(${a})`}
    />
  );
}

export default function WeddingPanel() {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(150deg, #dce8d8 0%, #e8e4dc 55%, #ede0d4 100%)" }}
    >
      <svg
        viewBox="0 0 600 900"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Soft watercolor blob top-right */}
        <ellipse cx={560} cy={80}  rx={240} ry={170} fill="#c8ddc0" opacity={0.22} />
        <ellipse cx={600} cy={40}  rx={160} ry={100} fill="#d4e8cc" opacity={0.15} />

        {/* Soft watercolor blob bottom-left */}
        <ellipse cx={60}  cy={840} rx={220} ry={160} fill="#c8ddc0" opacity={0.2}  />
        <ellipse cx={10}  cy={900} rx={140} ry={90}  fill="#d4e8cc" opacity={0.15} />

        {/* ── TOP-RIGHT CLUSTER ── */}
        {/* Leaves — back layer, more spread */}
        <Leaf x={590} y={210} len={115} a={10}   fill="#4e6e45" />
        <Leaf x={560} y={190} len={105} a={-8}   fill="#5a7851" />
        <Leaf x={530} y={210} len={100} a={22}   fill="#7a9b6f" />
        <Leaf x={488} y={195} len={110} a={-32}  fill="#5a7851" />
        <Leaf x={452} y={172} len={100} a={-52}  fill="#6a8860" />
        <Leaf x={418} y={140} len={90}  a={-72}  fill="#7a9b6f" />
        <Leaf x={390} y={100} len={80}  a={-90}  fill="#5a7851" />
        <Leaf x={600} y={140} len={85}  a={18}   fill="#6a8860" />
        <Leaf x={600} y={80}  len={70}  a={5}    fill="#8aaa80" />
        <Leaf x={560} y={55}  len={65}  a={-18}  fill="#7a9b6f" />
        <Leaf x={490} y={30}  len={60}  a={-55}  fill="#6a8860" />
        <Leaf x={430} y={28}  len={55}  a={-85}  fill="#5a7851" />
        <Leaf x={370} y={62}  len={70}  a={-95}  fill="#8aaa80" />
        <Leaf x={350} y={130} len={65}  a={-48}  fill="#6a8860" />

        {/* Gold branches */}
        <path d="M 305 205 Q 430 110 570 10"  stroke="#c4974a" strokeWidth="1"   fill="none" />
        <path d="M 390 155 Q 470 80  570 30"  stroke="#c4974a" strokeWidth="0.8" fill="none" />
        {([[348,158,-65],[420,100,-32],[488,52,5],[545,18,20]] as [number,number,number][]).map(([lx,ly,la],i) => (
          <GoldLeaf key={i} x={lx} y={ly} len={44} a={la} />
        ))}
        <GoldLeaf x={400} y={58}  len={38} a={-55} />
        <GoldLeaf x={470} y={28}  len={34} a={-20} />
        <GoldLeaf x={595} y={158} len={32} a={30}  />
        <GoldLeaf x={600} y={95}  len={30} a={15}  />

        {/* Berries top */}
        {([[362,114],[350,100],[340,114],[353,126],[338,128],[370,88],[358,78]] as [number,number][]).map(([bx,by],i) => (
          <circle key={i} cx={bx} cy={by} r={i < 5 ? 4 : 2.5} fill={i < 5 ? "#3d5c3a" : "#4d7048"} />
        ))}
        <path d="M 360 130 L 362 114 M 360 130 L 350 100 M 360 130 L 340 114 M 360 130 L 353 126 M 360 130 L 338 128"
          stroke="#3d5c3a" strokeWidth="1" fill="none" />

        {/* ROSES top-right — bigger & more */}
        <Rose cx={530} cy={148} size={75} c1="#f0c4cc" c2="#dfa0ae" c3="#c87888" rot={15}  />
        <Rose cx={420} cy={62}  size={56} c1="#f0c8a8" c2="#d8a080" c3="#c08060" rot={-10} />
        <Rose cx={595} cy={75}  size={42} c1="#f0c4cc" c2="#dfa0ae" c3="#c87888" rot={28}  />
        <Rose cx={480} cy={22}  size={35} c1="#f0c8a8" c2="#d8a080" c3="#c08060" rot={5}   />
        <Rose cx={598} cy={170} size={30} c1="#f0c4cc" c2="#dfa0ae" c3="#c87888" rot={-18} />

        {/* ── BOTTOM-LEFT CLUSTER ── */}
        {/* Leaves back layer, more spread into corner */}
        <Leaf x={10}  y={760} len={115} a={108} fill="#4e6e45" />
        <Leaf x={10}  y={820} len={105} a={92}  fill="#5a7851" />
        <Leaf x={30}  y={895} len={100} a={75}  fill="#7a9b6f" />
        <Leaf x={70}  y={900} len={95}  a={55}  fill="#6a8860" />
        <Leaf x={110} y={895} len={90}  a={35}  fill="#5a7851" />
        <Leaf x={148} y={875} len={85}  a={15}  fill="#7a9b6f" />
        <Leaf x={175} y={840} len={80}  a={-5}  fill="#6a8860" />
        <Leaf x={195} y={800} len={75}  a={-22} fill="#5a7851" />
        <Leaf x={210} y={755} len={70}  a={-40} fill="#8aaa80" />
        <Leaf x={10}  y={700} len={80}  a={122} fill="#6a8860" />
        <Leaf x={40}  y={680} len={70}  a={140} fill="#7a9b6f" />
        <Leaf x={82}  y={668} len={65}  a={158} fill="#5a7851" />
        <Leaf x={130} y={660} len={60}  a={175} fill="#8aaa80" />
        <Leaf x={170} y={672} len={55}  a={-165} fill="#6a8860" />

        {/* Gold branches bottom */}
        <path d="M 268 705 Q 155 790 18 880"  stroke="#c4974a" strokeWidth="1"   fill="none" />
        <path d="M 215 740 Q 118 820 10 900"  stroke="#c4974a" strokeWidth="0.8" fill="none" />
        {([[205,760,-148],[148,808,172],[90,852,108],[30,892,80]] as [number,number,number][]).map(([lx,ly,la],i) => (
          <GoldLeaf key={i} x={lx} y={ly} len={42} a={la} />
        ))}
        <GoldLeaf x={58}  y={748} len={34} a={128} />
        <GoldLeaf x={240} y={728} len={36} a={-155} />
        <GoldLeaf x={10}  y={762} len={30} a={100} />

        {/* Berries bottom */}
        {([[242,715],[252,702],[262,715],[250,724],[264,726],[248,692],[258,682]] as [number,number][]).map(([bx,by],i) => (
          <circle key={i} cx={bx} cy={by} r={i < 5 ? 4 : 2.5} fill={i < 5 ? "#3d5c3a" : "#4d7048"} />
        ))}
        <path d="M 250 728 L 242 715 M 250 728 L 252 702 M 250 728 L 262 715 M 250 728 L 264 726"
          stroke="#3d5c3a" strokeWidth="1" fill="none" />

        {/* ROSES bottom-left — bigger & more */}
        <Rose cx={88}  cy={748} size={68} c1="#f0c8a8" c2="#d8a080" c3="#c08060" rot={-22} />
        <Rose cx={182} cy={820} size={50} c1="#f0c4cc" c2="#dfa0ae" c3="#c87888" rot={12}  />
        <Rose cx={28}  cy={830} size={42} c1="#f0c8a8" c2="#d8a080" c3="#c08060" rot={-35} />
        <Rose cx={128} cy={880} size={35} c1="#f0c4cc" c2="#dfa0ae" c3="#c87888" rot={20}  />
        <Rose cx={210} cy={880} size={28} c1="#f0c8a8" c2="#d8a080" c3="#c08060" rot={-8}  />

        {/* ── SCATTERED GOLD DOTS ── */}
        {([
          [285,82,3.5],[310,148,2.5],[268,170,2],[558,198,3],
          [308,52,2.5],[258,102,2],[332,748,3],[280,802,2.5],[255,762,2],[312,832,2],
        ] as [number,number,number][]).map(([dx,dy,dr],i) => (
          <circle key={i} cx={dx} cy={dy} r={dr} fill="#c4974a" opacity={0.65} />
        ))}

        {/* ── CENTER ORNAMENT ── */}
        <line x1={148} y1={450} x2={248} y2={450} stroke="#c4974a" strokeWidth="0.8" />
        <line x1={352} y1={450} x2={452} y2={450} stroke="#c4974a" strokeWidth="0.8" />
        <circle cx={300} cy={450} r={3.2} fill="#c4974a" />
        <circle cx={270} cy={450} r={1.8} fill="#c4974a" opacity={0.6} />
        <circle cx={330} cy={450} r={1.8} fill="#c4974a" opacity={0.6} />
      </svg>

      {/* Text — HTML overlay so Playfair font renders properly */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 text-center" style={{ transform: "translateY(-1rem)" }}>
        <p
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "3.2rem",
            fontWeight: 600,
            color: "#1c2018",
            lineHeight: 1.15,
          }}
        >
          Fotoğrafla
        </p>
        <div style={{ height: "1.8rem" }} />
        <p
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "1.25rem",
            fontStyle: "italic",
            color: "#3d5c3a",
            lineHeight: 1.7,
          }}
        >
          Anılarınız tek bir çerçevede.
        </p>
      </div>
    </div>
  );
}
