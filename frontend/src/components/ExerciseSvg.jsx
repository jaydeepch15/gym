import React from "react";

/**
 * Animated line figures for each exercise. Each figure isolates the moving
 * body parts into <g> layers with dedicated CSS keyframe classes.
 * All figures share a chalk-on-obsidian aesthetic.
 */

const stroke = "#F0EAD9";
const barColor = "#DC2626";

const S = ({ children }) => (
    <svg
        viewBox="0 0 220 220"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
    >
        <defs>
            <pattern id="stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(240,234,217,0.06)" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="220" height="220" fill="url(#stripes)" />
        <line x1="10" y1="200" x2="210" y2="200" stroke="rgba(240,234,217,0.35)" strokeWidth="1.5" />
        {children}
    </svg>
);

const Head = ({ cx, cy, r = 12 }) => (
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="3" />
);
const L = (p) => <line stroke={stroke} strokeWidth="4" strokeLinecap="round" {...p} />;
const Bar = (p) => <line stroke={barColor} strokeWidth="6" strokeLinecap="round" {...p} />;
const Plate = ({ cx, cy, r = 12 }) => (
    <g>
        <circle cx={cx} cy={cy} r={r} fill={barColor} stroke="#7f1414" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#7f1414" strokeWidth="2" />
    </g>
);

// ---------- exercise figures ----------

const Neck = () => (
    <S>
        <L x1="110" y1="96" x2="110" y2="150" />
        <L x1="110" y1="150" x2="80" y2="195" />
        <L x1="110" y1="150" x2="140" y2="195" />
        <g className="anim-rotate-slow" style={{ transformOrigin: "110px 80px", transformBox: "fill-box" }}>
            <Head cx={110} cy={80} r={16} />
            <path d="M100 65 q10 -12 20 0" stroke={stroke} strokeWidth="2" fill="none" />
        </g>
    </S>
);

const Shoulder = () => (
    <S>
        <Head cx={110} cy={70} r={14} />
        <L x1="110" y1="85" x2="110" y2="150" />
        <L x1="110" y1="150" x2="90" y2="195" />
        <L x1="110" y1="150" x2="130" y2="195" />
        <g className="anim-rotate-med" style={{ transformOrigin: "110px 100px", transformBox: "fill-box" }}>
            <L x1="110" y1="100" x2="70" y2="130" />
            <L x1="110" y1="100" x2="150" y2="130" />
        </g>
    </S>
);

const Hip = () => (
    <S>
        <Head cx={110} cy={70} r={14} />
        <L x1="110" y1="85" x2="110" y2="150" />
        <L x1="110" y1="150" x2="85" y2="195" />
        <L x1="110" y1="150" x2="135" y2="195" />
        <g className="anim-rotate-med" style={{ transformOrigin: "110px 125px", transformBox: "fill-box" }}>
            <ellipse cx="110" cy="125" rx="24" ry="12" fill="none" stroke={stroke} strokeWidth="3" strokeDasharray="3 5" />
        </g>
    </S>
);

const Squat = () => (
    <S>
        <g className="anim-squat">
            <Head cx={110} cy={70} r={12} />
            <L x1="110" y1="82" x2="110" y2="135" />
            <L x1="110" y1="100" x2="80" y2="118" />
            <L x1="110" y1="100" x2="140" y2="118" />
            <L x1="110" y1="135" x2="85" y2="165" />
            <L x1="85" y1="165" x2="85" y2="195" />
            <L x1="110" y1="135" x2="135" y2="165" />
            <L x1="135" y1="165" x2="135" y2="195" />
        </g>
    </S>
);

const SquatBar = () => (
    <S>
        <g className="anim-squat">
            <Head cx={110} cy={70} r={12} />
            <L x1="110" y1="82" x2="110" y2="135" />
            <L x1="110" y1="135" x2="85" y2="165" />
            <L x1="85" y1="165" x2="85" y2="195" />
            <L x1="110" y1="135" x2="135" y2="165" />
            <L x1="135" y1="165" x2="135" y2="195" />
            <Bar x1="55" y1="90" x2="165" y2="90" />
            <Plate cx="55" cy="90" />
            <Plate cx="165" cy="90" />
        </g>
    </S>
);

const Bridge = () => (
    <S>
        <Head cx={55} cy={155} r={12} />
        <L x1="45" y1="165" x2="20" y2="170" />
        <g className="anim-bridge">
            <L x1="65" y1="150" x2="155" y2="120" />
            <L x1="155" y1="120" x2="180" y2="180" />
            <L x1="150" y1="120" x2="130" y2="180" />
        </g>
    </S>
);

const RowBar = () => (
    <S>
        <Head cx={70} cy={70} r={12} />
        <L x1="80" y1="80" x2="150" y2="110" />
        <L x1="150" y1="110" x2="150" y2="195" />
        <g className="anim-row">
            <L x1="150" y1="110" x2="120" y2="150" />
            <Bar x1="60" y1="150" x2="150" y2="150" />
            <Plate cx="60" cy="150" />
            <Plate cx="150" cy="150" />
        </g>
    </S>
);

const OhpBar = () => (
    <S>
        <Head cx={110} cy={80} r={12} />
        <L x1="110" y1="92" x2="110" y2="150" />
        <L x1="110" y1="150" x2="90" y2="195" />
        <L x1="110" y1="150" x2="130" y2="195" />
        <g className="anim-ohp">
            <L x1="110" y1="105" x2="80" y2="70" />
            <L x1="110" y1="105" x2="140" y2="70" />
            <Bar x1="55" y1="55" x2="165" y2="55" />
            <Plate cx="55" cy="55" />
            <Plate cx="165" cy="55" />
        </g>
    </S>
);

const CurlEz = () => (
    <S>
        <Head cx={110} cy={72} r={12} />
        <L x1="110" y1="84" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        {/* upper arms fixed */}
        <L x1="110" y1="105" x2="102" y2="130" />
        <L x1="110" y1="105" x2="118" y2="130" />
        {/* forearms + bar rotate up */}
        <g className="anim-curl-left" style={{ transformOrigin: "102px 130px", transformBox: "fill-box" }}>
            <L x1="102" y1="130" x2="90" y2="150" />
        </g>
        <g className="anim-curl-right" style={{ transformOrigin: "118px 130px", transformBox: "fill-box" }}>
            <L x1="118" y1="130" x2="130" y2="150" />
        </g>
        <g className="anim-curl-left" style={{ transformOrigin: "110px 130px", transformBox: "fill-box" }}>
            <Bar x1="85" y1="150" x2="135" y2="150" />
        </g>
    </S>
);

const ReverseCurl = () => (
    <S>
        <Head cx={110} cy={72} r={12} />
        <L x1="110" y1="84" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <L x1="110" y1="105" x2="102" y2="130" />
        <L x1="110" y1="105" x2="118" y2="130" />
        <g className="anim-curl-left" style={{ transformOrigin: "102px 130px", transformBox: "fill-box" }}>
            <L x1="102" y1="130" x2="90" y2="150" />
        </g>
        <g className="anim-curl-right" style={{ transformOrigin: "118px 130px", transformBox: "fill-box" }}>
            <L x1="118" y1="130" x2="130" y2="150" />
        </g>
        <g className="anim-curl-left" style={{ transformOrigin: "110px 130px", transformBox: "fill-box" }}>
            <Bar x1="80" y1="150" x2="140" y2="150" />
            <line x1="86" y1="142" x2="86" y2="158" stroke={stroke} strokeWidth="2" />
            <line x1="134" y1="142" x2="134" y2="158" stroke={stroke} strokeWidth="2" />
        </g>
    </S>
);

const RdlBar = () => (
    <S>
        <L x1="150" y1="105" x2="150" y2="195" />
        <g className="anim-hinge">
            <Head cx={80} cy={70} r={12} />
            <L x1="88" y1="80" x2="150" y2="105" />
        </g>
        <g className="anim-hinge-bar">
            <L x1="150" y1="105" x2="140" y2="150" />
            <Bar x1="105" y1="150" x2="175" y2="150" />
            <Plate cx="105" cy="150" />
            <Plate cx="175" cy="150" />
        </g>
    </S>
);

const FloorPress = () => (
    <S>
        <Head cx={35} cy={170} r={12} />
        <L x1="47" y1="170" x2="200" y2="170" />
        <g className="anim-floorpress">
            <L x1="90" y1="170" x2="110" y2="130" />
            <L x1="110" y1="130" x2="130" y2="150" />
            <L x1="140" y1="170" x2="160" y2="130" />
            <L x1="160" y1="130" x2="180" y2="150" />
            <Bar x1="90" y1="115" x2="180" y2="115" />
            <Plate cx="90" cy="115" />
            <Plate cx="180" cy="115" />
        </g>
    </S>
);

const Shrug = () => (
    <S>
        <Head cx={110} cy={65} r={12} />
        <L x1="110" y1="77" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <g className="anim-shrug">
            <L x1="110" y1="90" x2="80" y2="90" />
            <L x1="110" y1="90" x2="140" y2="90" />
            <L x1="80" y1="90" x2="80" y2="170" />
            <L x1="140" y1="90" x2="140" y2="170" />
            <Bar x1="55" y1="170" x2="165" y2="170" />
            <Plate cx="55" cy="170" />
            <Plate cx="165" cy="170" />
        </g>
    </S>
);

const CatCow = () => (
    <S>
        <g className="anim-catcow">
            <path d="M40 160 Q110 130 180 160" fill="none" stroke={stroke} strokeWidth="4" />
            <Head cx={40} cy={155} r={11} />
            <L x1="60" y1="160" x2="60" y2="195" />
            <L x1="180" y1="160" x2="180" y2="195" />
        </g>
    </S>
);

const ChildPose = () => (
    <S>
        <g className="anim-brace">
            <path d="M40 190 Q110 100 180 190" fill="none" stroke={stroke} strokeWidth="4" />
            <Head cx={40} cy={190} r={10} />
        </g>
    </S>
);

const Breath = () => (
    <S>
        <g className="anim-breath">
            <circle cx="110" cy="110" r="50" fill="none" stroke={stroke} strokeWidth="3" opacity="0.5" />
            <circle cx="110" cy="110" r="30" fill="none" stroke={stroke} strokeWidth="3" opacity="0.8" />
            <circle cx="110" cy="110" r="12" fill={barColor} />
        </g>
    </S>
);

const Wgs = () => (
    <S>
        <Head cx={80} cy={100} r={12} />
        <L x1="88" y1="108" x2="140" y2="140" />
        <L x1="140" y1="140" x2="110" y2="195" />
        <L x1="140" y1="140" x2="180" y2="195" />
        <L x1="90" y1="108" x2="130" y2="180" />
        <g className="anim-wgs">
            <L x1="90" y1="108" x2="80" y2="60" />
        </g>
    </S>
);

const Hip9090 = () => (
    <S>
        <Head cx={110} cy={80} r={12} />
        <L x1="110" y1="92" x2="110" y2="150" />
        <g className="anim-hip9090">
            <L x1="110" y1="150" x2="60" y2="150" />
            <L x1="60" y1="150" x2="60" y2="185" />
            <L x1="110" y1="150" x2="160" y2="150" />
            <L x1="160" y1="150" x2="160" y2="185" />
        </g>
    </S>
);

const Tspine = () => (
    <S>
        <Head cx={60} cy={130} r={12} />
        <L x1="72" y1="130" x2="160" y2="130" />
        <L x1="130" y1="130" x2="115" y2="195" />
        <L x1="150" y1="130" x2="155" y2="195" />
        <g className="anim-tspine">
            <L x1="130" y1="130" x2="170" y2="90" />
        </g>
    </S>
);

const DeadBug = () => (
    <S>
        <Head cx={35} cy={165} r={12} />
        <L x1="47" y1="165" x2="200" y2="165" />
        <g className="anim-deadbug-a">
            <L x1="70" y1="165" x2="40" y2="120" />
            <L x1="140" y1="165" x2="170" y2="120" />
        </g>
        <g className="anim-deadbug-b">
            <L x1="90" y1="165" x2="120" y2="105" />
            <L x1="160" y1="165" x2="130" y2="120" />
        </g>
    </S>
);

const Plank = () => (
    <S>
        <g className="anim-brace">
            <Head cx={35} cy={140} r={12} />
            <L x1="47" y1="140" x2="195" y2="150" />
            <L x1="50" y1="140" x2="50" y2="195" />
            <L x1="180" y1="150" x2="180" y2="195" />
        </g>
    </S>
);

const SidePlank = () => (
    <S>
        <g className="anim-brace">
            <L x1="30" y1="180" x2="190" y2="120" />
            <Head cx={190} cy={115} r={12} />
            <L x1="30" y1="180" x2="30" y2="195" />
            <L x1="30" y1="180" x2="55" y2="140" />
        </g>
    </S>
);

const Hollow = () => (
    <S>
        <g className="anim-brace">
            <path d="M30 150 Q110 190 190 150" fill="none" stroke={stroke} strokeWidth="4" />
            <Head cx={30} cy={140} r={10} />
            <L x1="30" y1="140" x2="20" y2="90" />
            <L x1="190" y1="150" x2="200" y2="90" />
        </g>
    </S>
);

const Jog = () => (
    <S>
        <Head cx={110} cy={65} r={12} />
        <L x1="110" y1="77" x2="110" y2="140" />
        {/* arms */}
        <g className="anim-arm-a"><L x1="110" y1="95" x2="80" y2="115" /></g>
        <g className="anim-arm-b"><L x1="110" y1="95" x2="140" y2="115" /></g>
        {/* legs */}
        <g className="anim-leg-a"><L x1="110" y1="140" x2="110" y2="185" /></g>
        <g className="anim-leg-b"><L x1="110" y1="140" x2="110" y2="185" /></g>
    </S>
);

const LegSwing = () => (
    <S>
        <Head cx={110} cy={70} r={12} />
        <L x1="110" y1="82" x2="110" y2="150" />
        <L x1="110" y1="150" x2="105" y2="195" />
        <L x1="90" y1="120" x2="70" y2="130" />
        <g className="anim-legswing">
            <L x1="110" y1="150" x2="110" y2="195" />
        </g>
    </S>
);

const ArmCircle = () => (
    <S>
        <Head cx={110} cy={80} r={12} />
        <L x1="110" y1="92" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <g className="anim-rotate-med" style={{ transformOrigin: "110px 105px", transformBox: "fill-box" }}>
            <L x1="110" y1="105" x2="70" y2="90" />
            <L x1="110" y1="105" x2="150" y2="120" />
        </g>
    </S>
);

const Lunge = () => (
    <S>
        <g className="anim-squat">
            <Head cx={110} cy={70} r={12} />
            <L x1="110" y1="82" x2="110" y2="135" />
            <L x1="110" y1="135" x2="150" y2="170" />
            <L x1="150" y1="170" x2="150" y2="195" />
            <L x1="110" y1="135" x2="75" y2="180" />
            <L x1="75" y1="180" x2="55" y2="195" />
        </g>
    </S>
);

const BatSwing = () => (
    <S>
        <Head cx={110} cy={70} r={12} />
        <L x1="110" y1="82" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <g className="anim-batswing">
            <L x1="110" y1="100" x2="150" y2="90" />
            <line x1="150" y1="90" x2="200" y2="55" stroke="#F0EAD9" strokeWidth="6" strokeLinecap="round" />
        </g>
    </S>
);

const Throw = () => (
    <S>
        <Head cx={110} cy={75} r={12} />
        <L x1="110" y1="87" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <L x1="110" y1="105" x2="150" y2="120" />
        <g className="anim-throw">
            <L x1="110" y1="100" x2="90" y2="50" />
            <circle cx="90" cy="50" r="8" fill={barColor} />
        </g>
    </S>
);

const Walk = () => (
    <S>
        <Head cx={110} cy={80} r={12} />
        <L x1="110" y1="92" x2="110" y2="150" />
        <g className="anim-arm-a"><L x1="110" y1="105" x2="90" y2="130" /></g>
        <g className="anim-arm-b"><L x1="110" y1="105" x2="130" y2="130" /></g>
        <g className="anim-leg-a"><L x1="110" y1="150" x2="110" y2="195" /></g>
        <g className="anim-leg-b"><L x1="110" y1="150" x2="110" y2="195" /></g>
    </S>
);

const HamStretch = () => (
    <S>
        <g className="anim-ham">
            <Head cx={70} cy={80} r={12} />
            <path d="M70 92 Q100 130 150 120" fill="none" stroke={stroke} strokeWidth="4" />
        </g>
        <L x1="150" y1="120" x2="150" y2="195" />
    </S>
);

const HipFlex = () => (
    <S>
        <g className="anim-brace">
            <Head cx={110} cy={80} r={12} />
            <L x1="110" y1="92" x2="110" y2="150" />
            <L x1="110" y1="150" x2="60" y2="195" />
            <L x1="110" y1="150" x2="170" y2="150" />
            <L x1="170" y1="150" x2="170" y2="195" />
        </g>
    </S>
);

const Calf = () => (
    <S>
        <g className="anim-brace">
            <Head cx={110} cy={70} r={12} />
            <L x1="110" y1="82" x2="110" y2="145" />
            <L x1="110" y1="145" x2="60" y2="195" />
            <L x1="110" y1="145" x2="170" y2="195" />
        </g>
    </S>
);

const CrossShoulder = () => (
    <S>
        <Head cx={110} cy={80} r={12} />
        <L x1="110" y1="92" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <g className="anim-cross">
            <L x1="110" y1="105" x2="160" y2="105" />
            <L x1="110" y1="105" x2="60" y2="130" />
        </g>
    </S>
);

const ChestOpen = () => (
    <S>
        <Head cx={110} cy={70} r={12} />
        <L x1="110" y1="82" x2="110" y2="150" />
        <L x1="110" y1="150" x2="95" y2="195" />
        <L x1="110" y1="150" x2="125" y2="195" />
        <g className="anim-chestopen">
            <L x1="110" y1="100" x2="70" y2="170" />
            <L x1="110" y1="100" x2="150" y2="170" />
            <L x1="70" y1="170" x2="150" y2="170" />
        </g>
    </S>
);

const map = {
    neck: Neck,
    shoulder: Shoulder,
    hip: Hip,
    squat: Squat,
    squat_bar: SquatBar,
    bridge: Bridge,
    row_bar: RowBar,
    ohp_bar: OhpBar,
    curl_ez: CurlEz,
    rcurl_ez: ReverseCurl,
    rdl_bar: RdlBar,
    floorpress: FloorPress,
    shrug: Shrug,
    catcow: CatCow,
    child: ChildPose,
    breath: Breath,
    wgs: Wgs,
    hip9090: Hip9090,
    tspine: Tspine,
    deadbug: DeadBug,
    plank: Plank,
    sideplank: SidePlank,
    hollow: Hollow,
    jog: Jog,
    legswing: LegSwing,
    armcircle: ArmCircle,
    lunge: Lunge,
    batswing: BatSwing,
    throw: Throw,
    walk: Walk,
    hamstretch: HamStretch,
    hipflex: HipFlex,
    calf: Calf,
    crossshoulder: CrossShoulder,
    chestopen: ChestOpen,
};

export default function ExerciseSvg({ id }) {
    const Cmp = map[id] || Squat;
    return <Cmp />;
}
