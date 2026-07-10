// WA Legislative Web Services — GetLegislationIntroducedSince
// Run in browser console on https://wslwebservices.leg.wa.gov/
//
// Returns all legislation introduced since 1/1/2026 as a JS array of objects.

(async () => {
  const sinceDate = "2026-01-01";
  const url = `/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${sinceDate}`;

  console.log(`Fetching legislation introduced since ${sinceDate}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");

  // Check for SOAP/XML errors
  const err = xml.querySelector("parsererror");
  if (err) throw new Error("XML parse error: " + err.textContent);

  // Convert each <Legislation> element into a plain object
  function elementToObj(el) {
    const obj = {};
    for (const child of el.children) {
      if (child.children.length === 0) {
        obj[child.localName] = child.textContent;
      } else {
        // Nested element — check if it's an array (repeated child names)
        const childNames = [...child.children].map(c => c.localName);
        const unique = new Set(childNames);
        if (unique.size === 1 && childNames.length > 1) {
          // Array of repeated elements
          obj[child.localName] = [...child.children].map(c => elementToObj(c));
        } else if (unique.size < childNames.length) {
          // Mixed repeated — treat as array
          obj[child.localName] = [...child.children].map(c => elementToObj(c));
        } else {
          obj[child.localName] = elementToObj(child);
        }
      }
    }
    return obj;
  }

  const legislation = [...xml.querySelectorAll("Legislation")].map(elementToObj);

  console.log(`Found ${legislation.length} bills introduced since ${sinceDate}`);
  console.log(legislation);
  return legislation;
})();
