document.addEventListener("DOMContentLoaded", () => {
    const dobInput = document.getElementById('dob');
    const predictBtn = document.getElementById('predict-btn');
    const errorMsg = document.getElementById('error-msg');
    
    const inputSection = document.querySelector('.input-section');
    const resultSection = document.getElementById('result-section');
    
    const zodiacIcon = document.getElementById('zodiac-icon');
    const zodiacName = document.getElementById('zodiac-name');
    const dailyPrediction = document.getElementById('daily-prediction');
    const partnerName = document.getElementById('partner-name');
    const partnerReason = document.getElementById('partner-reason');
    const resetBtn = document.getElementById('reset-btn');

    const pathContainer = document.getElementById('zodiac-path');
    const svgLine = document.getElementById('path-line');

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    document.body.appendChild(tooltip);

    const zodiacSigns = [
        { name: "Capricorn", symbol: "♑", start: {m: 1, d: 1}, end: {m: 1, d: 19} },
        { name: "Aquarius", symbol: "♒", start: {m: 1, d: 20}, end: {m: 2, d: 18} },
        { name: "Pisces", symbol: "♓", start: {m: 2, d: 19}, end: {m: 3, d: 20} },
        { name: "Aries", symbol: "♈", start: {m: 3, d: 21}, end: {m: 4, d: 19} },
        { name: "Taurus", symbol: "♉", start: {m: 4, d: 20}, end: {m: 5, d: 20} },
        { name: "Gemini", symbol: "♊", start: {m: 5, d: 21}, end: {m: 6, d: 20} },
        { name: "Cancer", symbol: "♋", start: {m: 6, d: 21}, end: {m: 7, d: 22} },
        { name: "Leo", symbol: "♌", start: {m: 7, d: 23}, end: {m: 8, d: 22} },
        { name: "Virgo", symbol: "♍", start: {m: 8, d: 23}, end: {m: 9, d: 22} },
        { name: "Libra", symbol: "♎", start: {m: 9, d: 23}, end: {m: 10, d: 22} },
        { name: "Scorpio", symbol: "♏", start: {m: 10, d: 23}, end: {m: 11, d: 21} },
        { name: "Sagittarius", symbol: "♐", start: {m: 11, d: 22}, end: {m: 12, d: 21} },
        { name: "Capricorn", symbol: "♑", start: {m: 12, d: 22}, end: {m: 12, d: 31} }
    ];

    const uniqueSigns = [
        { name: "Capricorn", symbol: "♑", startStr: "Dec 22", endStr: "Jan 19" },
        { name: "Aquarius", symbol: "♒", startStr: "Jan 20", endStr: "Feb 18" },
        { name: "Pisces", symbol: "♓", startStr: "Feb 19", endStr: "Mar 20" },
        { name: "Aries", symbol: "♈", startStr: "Mar 21", endStr: "Apr 19" },
        { name: "Taurus", symbol: "♉", startStr: "Apr 20", endStr: "May 20" },
        { name: "Gemini", symbol: "♊", startStr: "May 21", endStr: "Jun 20" },
        { name: "Cancer", symbol: "♋", startStr: "Jun 21", endStr: "Jul 22" },
        { name: "Leo", symbol: "♌", startStr: "Jul 23", endStr: "Aug 22" },
        { name: "Virgo", symbol: "♍", startStr: "Aug 23", endStr: "Sep 22" },
        { name: "Libra", symbol: "♎", startStr: "Sep 23", endStr: "Oct 22" },
        { name: "Scorpio", symbol: "♏", startStr: "Oct 23", endStr: "Nov 21" },
        { name: "Sagittarius", symbol: "♐", startStr: "Nov 22", endStr: "Dec 21" }
    ];

    function getZodiac(month, day) {
        return zodiacSigns.find(sign => 
            (month === sign.start.m && day >= sign.start.d) || 
            (month === sign.end.m && day <= sign.end.d)
        );
    }

    async function getDailyPrediction(signName) {
        try {
            const apiURL = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${signName}&day=today`;
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiURL)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error("CORS proxy or API unavailable");
            const data = await res.json();
            return data.data.horoscope;
        } catch(e) {
            console.error("API error, using algorithmic fallback: ", e);
            const dynamicFragments = [
                "A sudden synchronization in the cosmic data streams reveals an unexpected opportunity today.",
                "Your neural pathways are exceptionally aligned with the stars. Trust your intuition.",
                "Harmonic resonances are peaking for your sign. Collaborating will yield favorable outputs.",
                "The planetary alignment indicates a surge in your creative algorithms.",
                "Your energy fields are stabilizing. A long-standing issue will suddenly resolve.",
                "Stellar fluctuations warn against over-exerting your physical processors today."
            ];
            const dateStr = new Date().toDateString();
            let hash = 0;
            const seed = signName + dateStr;
            for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
            return dynamicFragments[Math.abs(hash) % dynamicFragments.length];
        }
    }

    function getColumnCount() {
        if (window.innerWidth <= 400) return 2;
        if (window.innerWidth <= 600) return 3;
        if (window.innerWidth <= 900) return 4;
        return 6;
    }

    let currentCols = 0;

    function buildGrid() {
        if (!pathContainer || !svgLine) return;
        const targetCols = getColumnCount();
        
        // Block redundant recreations if layout hasn't broken CSS grid breakpoint threshold
        if (targetCols === currentCols && pathContainer.children.length > 0) {
            drawCurvyLine();
            return;
        }
        currentCols = targetCols;

        pathContainer.innerHTML = '';
        
        // Dynamically dice and reverse every alternative row chunk based on active responsive columns
        let visualArray = [];
        for (let i = 0; i < uniqueSigns.length; i += currentCols) {
            const chunk = uniqueSigns.slice(i, i + currentCols);
            if ((i / currentCols) % 2 === 1) { // odd physical row rendered right-to-left
                chunk.reverse();
            }
            visualArray.push(...chunk);
        }

        visualArray.forEach((sign) => {
            const step = document.createElement('div');
            step.className = 'grid-step';
            
            // Explicit marker referencing natural chronological sign index (0-11)
            const chronoIndex = uniqueSigns.indexOf(sign);
            step.setAttribute('data-index', chronoIndex);
            
            step.innerHTML = `
                <div class="path-node"><span>${sign.symbol}</span></div>
                <div class="path-info">
                    <strong>${sign.name}</strong>
                    <div>${sign.startStr} - ${sign.endStr}</div>
                </div>
            `;

            // Hover interactions for tooltips
            step.addEventListener('mouseenter', () => {
                tooltip.innerHTML = `<strong>${sign.name}</strong><br><span style="font-size: 0.85em; opacity: 0.8;">Click 'Reveal Destiny' for your daily horoscope.</span>`;
                tooltip.classList.add('visible');
            });
            
            step.addEventListener('mousemove', (e) => {
                const xOffset = 20;
                const yOffset = 20;
                let topPos = e.clientY + yOffset;
                let leftPos = e.clientX + xOffset;
                
                const tooltipRect = tooltip.getBoundingClientRect();
                if (leftPos + tooltipRect.width > window.innerWidth) {
                    leftPos = window.innerWidth - tooltipRect.width - 20;
                }
                if (topPos + tooltipRect.height > window.innerHeight) {
                    topPos = e.clientY - tooltipRect.height - yOffset;
                }
                
                tooltip.style.top = `${topPos}px`;
                tooltip.style.left = `${leftPos}px`;
            });

            step.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            pathContainer.appendChild(step);
        });
        
        setTimeout(drawCurvyLine, 50); 
    }

    function drawCurvyLine() {
        if (!pathContainer || !svgLine) return;
        const nodes = document.querySelectorAll('.path-node');
        if (nodes.length === 0) return;
        
        svgLine.setAttribute('width', pathContainer.offsetWidth);
        svgLine.setAttribute('height', pathContainer.scrollHeight);
        
        const containerRect = pathContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;
        
        let svgStr = `<path d="`;
        
        for (let i = 0; i < uniqueSigns.length; i++) {
            // Retrieve node strictly in mathematical chronological sequence regardless of arbitrary visual grid wrapper orientation
            const node = document.querySelector(`.grid-step[data-index="${i}"] .path-node`);
            if (!node) continue;
            
            const rect = node.getBoundingClientRect();
            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top + rect.height / 2;
            
            if (i === 0) {
                svgStr += `M ${x} ${y} `;
            } else {
                const prevNode = document.querySelector(`.grid-step[data-index="${i-1}"] .path-node`);
                const prevRect = prevNode.getBoundingClientRect();
                const px = prevRect.left - containerRect.left + prevRect.width / 2;
                const py = prevRect.top - containerRect.top + prevRect.height / 2;
                
                const dx = x - px;
                const dy = y - py;
                
                // Pure vertical loopback drops at the bounding edges of the layout
                if (Math.abs(dx) < 20 && Math.abs(dy) > 20) {
                    // Extend U-shape perfectly outwards based on visual hemisphere (push right if node is on the right side, push left if left side)
                    const nodeAbsoluteX = rect.left + rect.width / 2;
                    const isRightHemisphere = nodeAbsoluteX > containerCenter;
                    const uTurnRadius = isRightHemisphere ? 40 : -40;
                    
                    svgStr += `C ${px + uTurnRadius} ${py}, ${x + uTurnRadius} ${y}, ${x} ${y} `;
                } 
                // Classic topographic meandering trace lines
                else if (Math.abs(dx) > Math.abs(dy)) {
                   svgStr += `C ${px + dx/2} ${py}, ${x - dx/2} ${y}, ${x} ${y} `;
                } else { 
                   svgStr += `C ${px} ${py + dy/2}, ${x} ${y - dy/2}, ${x} ${y} `;
                }
            }
        }
        
        svgStr += `" fill="none" stroke="rgba(0, 240, 255, 0.4)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.8));" />`;
        svgLine.innerHTML = svgStr;
    }

    if (pathContainer && svgLine) {
        buildGrid();
        window.addEventListener('resize', buildGrid);
    }

    const partnerMatches = {
        "Aries": { match: "Leo", reason: "Fellow fire signs, you share a passionate, adventurous, and exciting bond." },
        "Taurus": { match: "Cancer", reason: "Providing emotional depth and comfort, Cancer is a nurturing match for your steadfast nature." },
        "Gemini": { match: "Aquarius", reason: "Connecting deeply on an intellectual level, you both appreciate free-flowing communication." },
        "Cancer": { match: "Scorpio", reason: "A deeply intuitive and intensely emotional pair, you understand each other implicitly." },
        "Leo": { match: "Sagittarius", reason: "Your boundless enthusiasm for life and adventure creates a vibrant, unstoppable partnership." },
        "Virgo": { match: "Capricorn", reason: "Sharing a grounded and practical approach, you build highly supportive goals together." },
        "Libra": { match: "Gemini", reason: "Connecting through intellectual pursuits and an active social life, harmony is easily maintained." },
        "Scorpio": { match: "Pisces", reason: "Creating magnetic emotional connections, your mutual loyalty and intuition are unmatched." },
        "Sagittarius": { match: "Aries", reason: "Sharing bold optimism and an endless drive for excitement keeps your relationship lively." },
        "Capricorn": { match: "Taurus", reason: "Valuing stability and mutual long-term ambitions creates a bedrock of enduring trust." },
        "Aquarius": { match: "Libra", reason: "Your innovative perspective perfectly complements their quest for intellectual harmony." },
        "Pisces": { match: "Cancer", reason: "Resulting in a profoundly empathetic connection, you provide genuine safe harbors for each other." }
    };

    predictBtn.addEventListener('click', async () => {
        const dateVal = dobInput.value;
        if (!dateVal) {
            errorMsg.style.display = 'block';
            dobInput.style.borderColor = '#ff3366';
            return;
        }
        
        errorMsg.style.display = 'none';
        dobInput.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        
        const dateObj = new Date(dateVal);
        const month = dateObj.getMonth() + 1; // 1-12
        const day = dateObj.getDate();

        const sign = getZodiac(month, day);
        
        // Setup initial loading state
        zodiacIcon.textContent = sign.symbol;
        zodiacName.textContent = sign.name;
        dailyPrediction.textContent = "Consulting the stars...";
        partnerName.textContent = "...";
        partnerReason.textContent = "Aligning frequencies...";

        inputSection.style.display = 'none';
        resultSection.classList.remove('hidden');
        resultSection.classList.add('visible');
        
        // Fetch real-time data
        const predictionText = await getDailyPrediction(sign.name);
        const partnerInfo = partnerMatches[sign.name];

        dailyPrediction.textContent = predictionText;
        partnerName.textContent = partnerInfo.match;
        partnerReason.textContent = partnerInfo.reason;
    });

    resetBtn.addEventListener('click', () => {
        resultSection.classList.remove('visible');
        resultSection.classList.add('hidden');
        
        setTimeout(() => {
            inputSection.style.display = 'flex';
        }, 400); 
    });
});
