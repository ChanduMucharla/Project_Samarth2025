let chart = null;
let cropChart = null;

document.getElementById('qform').addEventListener('submit', async function(e){
    e.preventDefault();
    const q = document.getElementById('question').value;
    if(!q) return alert('Please type a question');

    const res = await fetch('/api/query',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({question:q})
    });

    const data = await res.json();

    if(res.status!==200){
        document.getElementById('answer').innerText = data.error || 'Error';
        document.getElementById('sources').innerHTML = '';
        document.getElementById('topCrops').innerHTML = '';
        if(chart) chart.destroy();
        if(cropChart) cropChart.destroy();
        return;
    }

    const s1 = data.state1;
    const s2 = data.state2;

    // ------------------ Build Answer ------------------
    let ans = `${s1.name} - Avg Rainfall: ${s1.avg_rainfall ? s1.avg_rainfall.toFixed(2) : 'N/A'} mm\n`;
    ans += `${s2.name} - Avg Rainfall: ${s2.avg_rainfall ? s2.avg_rainfall.toFixed(2) : 'N/A'} mm\n\n`;
    ans += `Top crops ${s1.name}: ${s1.top_crops.map(c=>c.Crop).join(', ')}\n`;
    ans += `Top crops ${s2.name}: ${s2.top_crops.map(c=>c.Crop).join(', ')}\n`;
    document.getElementById('answer').innerText = ans;

    // ------------------ Sources ------------------
    const srcs = new Set();
    (s1.rain_sources||[]).forEach(r=>srcs.add(r.Source||''));
    (s2.rain_sources||[]).forEach(r=>srcs.add(r.Source||''));
    (s1.crop_sources||[]).forEach(r=>srcs.add(r));
    (s2.crop_sources||[]).forEach(r=>srcs.add(r));

    const sList = document.getElementById('sources');
    sList.innerHTML = '';
    srcs.forEach(s=>{ if(s) { const li=document.createElement('li'); li.innerText=s; sList.appendChild(li); }});

    // ------------------ Top Crops Display ------------------
    const tcDiv = document.getElementById('topCrops');
    tcDiv.innerHTML = `<h6>${s1.name}</h6><ul>${s1.top_crops.map(c=>`<li>${c.Crop}: ${c.Production}</li>`).join('')}</ul>
                       <h6>${s2.name}</h6><ul>${s2.top_crops.map(c=>`<li>${c.Crop}: ${c.Production}</li>`).join('')}</ul>`;

    // ------------------ Prepare Rainfall Chart ------------------
    const labels = Array.from(new Set([...(s1.rain_sources||[]).map(r=>r.Year), ...(s2.rain_sources||[]).map(r=>r.Year)]));
    labels.sort((a,b)=>a-b);

    const values1 = labels.map(l=>{
        const match = (s1.rain_sources||[]).find(r=>r.Year===l);
        return match ? match.Rainfall : 0;
    });
    const values2 = labels.map(l=>{
        const match = (s2.rain_sources||[]).find(r=>r.Year===l);
        return match ? match.Rainfall : 0;
    });

    const ctx = document.getElementById('rainChart').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx,{
        type:'bar',
        data:{
            labels: labels,
            datasets:[
                { label:s1.name, data: values1, backgroundColor:'#4a90e2' },
                { label:s2.name, data: values2, backgroundColor:'#e94e77' }
            ]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{ legend:{ position:'top' } },
            scales:{ y:{ beginAtZero:true, title:{ display:true, text:'Rainfall (mm)' } } }
        }
    });

    // ------------------ Crop Trend Chart ------------------
    const cropCtx = document.getElementById('cropChart').getContext('2d');
    if(cropChart) cropChart.destroy();

    const cropLabels = Array.from(new Set([...s1.top_crops.map(c=>c.Crop), ...s2.top_crops.map(c=>c.Crop)]));
    cropChart = new Chart(cropCtx,{
        type:'line',
        data:{
            labels: cropLabels,
            datasets:[
                { label:s1.name, data: cropLabels.map(c=>{ const f = s1.top_crops.find(t=>t.Crop===c); return f ? f.Production : 0; }), borderColor:'#4a90e2', fill:false, tension:0.3 },
                { label:s2.name, data: cropLabels.map(c=>{ const f = s2.top_crops.find(t=>t.Crop===c); return f ? f.Production : 0; }), borderColor:'#e94e77', fill:false, tension:0.3 }
            ]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{ legend:{ position:'top' } },
            scales:{ y:{ beginAtZero:true, title:{ display:true, text:'Production' } } }
        }
    });

});

// ------------------ Example Question ------------------
document.getElementById('exampleBtn').addEventListener('click', function(){
    document.getElementById('question').value = 'Compare average rainfall in Andhra Pradesh and Telangana for last 3 years and list top 2 crops.';
});

// ------------------ Light/Dark Mode ------------------
document.getElementById('toggleTheme').addEventListener('click', ()=>{
    document.body.classList.toggle('dark-mode');
});

