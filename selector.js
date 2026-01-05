// ----- Spindles / Chainlines -----
const spindles = [
  {name:"136",bbType:30,DM:52,DMW:55,flip:58.5,tooth:"NW"},
  {name:"136DH",bbType:30,DM:52,DMW:55,flip:58.5,tooth:"NW",DH:true},
  {name:"137",bbType:24,DM:52,DMW:55,flip:58.5,tooth:"NW"},
  {name:"143",bbType:30,DM:55.5,DMW:58.5,flip:62,tooth:"NW"},
  {name:"149",bbType:30,DM:58.5,DMW:61.5,flip:65,tooth:"NW"},
  {name:"151DH",bbType:30,DM:58.5,DMW:61.5,flip:65,tooth:"NW",DH:true},
  {name:"169",bbType:30,DM:68.5,DMW:71.5,flip:75,tooth:"NW"},
  {name:"189",bbType:30,DM:78.5,DMW:81.5,flip:85,tooth:"NW"},
  {name:"190",bbType:24,DM:78.5,DMW:81.5,flip:85,tooth:"NW"}
];

// ----- BB Compatibility -----
const spindleBBcompat = {
  "136":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm"],
  "136DH":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm"],
  "137":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm"],
  "143":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm"],
  "149":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm","BSA 83mm","BB107","BB104","PF30 83mm"],
  "151DH":["BSA 68/73mm","BB92","BB89","BB30 68/73mm","PF30 68/73mm","392EVO T47 68/73mm","BSA 83mm","BB107","BB104","PF30 83mm"],
  "169":["BSA 83mm","BB107","BB104","PF30 83mm","BSA 100mm","BB124","BB121","PF30 100mm"],
  "189":["BSA 100mm","BB124","BB121","PF30 100mm","BB132","BSA 120mm","BB144","BB141","PF30 120mm"],
  "190":["BSA 100mm","BB124","BB121","PF30 100mm"]
};

// ----- Drivetrain mapping -----
const dtMap = {
  "SHI12":"SHI12",
  "MICROSHIFT":"NW",
  "NW10_11":"NW",
  "NW10_12":"NW",
  "SRAM_TX":null
};

// ----- Form Handler -----
document.getElementById('selector-form').addEventListener('submit', function(e){
  e.preventDefault();

  const bbType = parseInt(document.getElementById('bbType').value);
  const drivetrain = document.getElementById('drivetrain').value;
  const bb = document.getElementById('bb').value;
  const chainline = parseFloat(document.getElementById('chainline').value);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if(drivetrain === "SRAM_TX"){
    resultsDiv.innerHTML = `
      <div class="error-note">
        SRAM Transmission is not currently supported.
      </div>`;
    return;
  }

  // ----- Step 1: Find all spindles that offer this chainline (±1 mm) -----
  const spindlesWithChainline = [];

  spindles.forEach(sp => {
    ["DM","DMW","flip"].forEach(r => {
      if(drivetrain === "SHI12" && r === "flip") return;
      const cl = sp[r];
      if(Math.abs(cl - chainline) <= 1){
        spindlesWithChainline.push({spindle: sp, ring: r});
      }
    });
  });

  // ----- Step 2: Decide which error / result to show -----

  if(spindlesWithChainline.length === 0){
    // 1️⃣ Chainline not offered for any spindle
    resultsDiv.innerHTML = `
      <div class="error-note">
        The requested chainline is not offered for any BB and spindle combination
        (±1 mm).<br>
        Please adjust your chainline or review available spindle options.
      </div>`;
    return;
  }

  // 2️⃣ Filter by BB compatibility
  const compatibleSpindles = spindlesWithChainline.filter(item => {
    const compatList = spindleBBcompat[item.spindle.name] || [];
    return compatList.includes(bb) && item.spindle.bbType === bbType;
  });

  if(compatibleSpindles.length === 0){
    // Chainline exists but none compatible with selected BB
    resultsDiv.innerHTML = `
      <div class="error-note">
        The requested chainline exists, but your selected BB or BB type is not compatible
        with any available spindle.<br>
        Please check your BB selection.
      </div>`;
    return;
  }

  // 3️⃣ Show results (chainline + BB compatible)
  compatibleSpindles.forEach(item => {
    const sp = item.spindle;
    const r = item.ring;
    const div = document.createElement('div');
    div.className = "result-item";
    div.innerHTML = `
      <strong>Spindle:</strong> ${sp.name}<br>
      <strong>Ring:</strong> ${r === "flip" ? "Flipped Orientation" : r}<br>
      <strong>Tooth Profile:</strong> ${dtMap[drivetrain]}<br>
      <strong>Chainline:</strong> ${sp[r]} mm<br>
      ${sp.DH ? `<em>DH spindle – Atlas only</em>` : ""}
    `;
    resultsDiv.appendChild(div);
  });
});
