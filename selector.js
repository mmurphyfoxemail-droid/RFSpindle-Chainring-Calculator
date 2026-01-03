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
  "169":["BSA 83mm","BB107","BB104","PF30 83mm","BSA 100mm","BB124","BB121","PF30 100mm","BB132","BSA 120mm","BB144","BB141","PF30 120mm"],
  "189":["BSA 100mm","BB124","BB121","PF30 100mm","BB132","BSA 120mm","BB144","BB141","PF30 120mm"],
  "190":["BSA 100mm","BB124","BB121","PF30 100mm","BB132","BSA 120mm","BB144","BB141","PF30 120mm"]
};

// ----- Drive train mapping -----
const dtMap = {
  "SHI12":"SHI12",
  "MICROSHIFT":"NW",
  "NW10_11":"NW",
  "NW10_12":"NW",
  "SRAM_TX":null
};

// ----- Selector Form -----
document.getElementById('selector-form').addEventListener('submit', function(e){
  e.preventDefault();
  const bbType = parseInt(document.getElementById('bbType').value);
  const drivetrainVal = document.getElementById('drivetrain').value;
  const bb = document.getElementById('bb').value;
  const requestedCL = parseFloat(document.getElementById('chainline').value);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if(drivetrainVal === "SRAM_TX"){
    resultsDiv.innerHTML = `We currently don't have options for SRAM Transmission.`;
    return;
  }

  let results = [];
  spindles.forEach(sp => {
    // BB Type filter
    if(sp.bbType !== bbType) return;

    // BB compatibility
    if(!spindleBBcompat[sp.name] || !spindleBBcompat[sp.name].includes(bb)) return;

    // Loop through rings
    ["DM","DMW","flip"].forEach(r => {
      // SHI12 cannot use flipped
      if(drivetrainVal === "SHI12" && r === "flip") return;

      const cl = sp[r];
      if(Math.abs(cl - requestedCL) <= 1){
        let note = "";
        if(sp.DH) note = "DH spindle, only compatible with Atlas Cranks";
        if(Math.abs(cl - requestedCL) === 1) note += " (note +/- 1 mm is within spec)";
        const ringName = (r==="flip") ? "Flipped Orientation" : r;
        const toothProfile = dtMap[drivetrainVal];
        results.push({spindle:sp.name, ring:ringName, tooth:toothProfile, chainline:cl, note});
      }
    });
  });

  if(results.length){
    results.forEach(r=>{
      const div = document.createElement('div');
      div.className = "result-item";
      div.innerHTML = `
        <strong>Spindle:</strong> ${r.spindle}<br>
        <strong>Ring:</strong> ${r.ring}<br>
        <strong>Tooth Profile:</strong> ${r.tooth}<br>
        <strong>Chainline:</strong> ${r.chainline} mm ${r.note}
      `;
      resultsDiv.appendChild(div);
    });
  } else {
    resultsDiv.innerHTML = `No valid combinations. Call Sales & Customer Service: 1-236-428-4656 or Email <a href="mailto:foxservice@ridefox.com">foxservice@ridefox.com</a>`;
  }
});
