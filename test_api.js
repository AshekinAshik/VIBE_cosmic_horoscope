async function test() {
  const target = 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=aries&day=today';
  
  // Test CodeTabs proxy
  try {
    console.log("Testing CodeTabs Proxy...");
    const p1 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`;
    const r1 = await fetch(p1);
    const text1 = await r1.text();
    console.log("CodeTabs status:", r1.status);
    console.log("CodeTabs body:", text1.substring(0, 100)); // Should be JSON
  } catch(e) { console.error("CodeTabs error:", e); }

  // Test some direct APIs that might exist and have CORS
  try {
    console.log("Testing sandipbgt (theastrologer) API...");
    const r2 = await fetch('http://sandipbgt.com/theastrologer/api/horoscope/aries/today');
    console.log("sandipbgt status:", r2.status);
    if(r2.ok) console.log(await r2.json());
  } catch(e) {}
  
  // Test OhMyZodiac if it exists
  try {
    console.log("Testing ohmyzodiac...");
    const r3 = await fetch('https://aztro.sameerkumar.website/?sign=aries&day=today', {method: 'POST'});
    console.log("aztro status:", r3.status);
    if(r3.ok) console.log(await r3.json());
  } catch(e) {}
}
test();
