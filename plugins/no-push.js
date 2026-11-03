// Wicki använder bara lokala påminnelser (schemalagda i telefonen). expo-notifications lägger ändå till
// rätten för fjärr-push (aps-environment), som Wickis provisioning profile saknar. Det här pluginet tar bort den
// både i konfigurationen och i den färdiga .entitlements-filen, efter att alla andra plugin har körts.
const fs = require('fs');
const path = require('path');
const { withEntitlementsPlist, withFinalizedMod } = require('expo/config-plugins');

module.exports = function withNoPush(config) {
  config = withEntitlementsPlist(config, c => { delete c.modResults['aps-environment']; return c; });
  config = withFinalizedMod(config, ['ios', async c => {
    const root = c.modRequest.platformProjectRoot;
    const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() && !['Pods', 'build'].includes(e.name) ? walk(path.join(d, e.name)) : e.name.endsWith('.entitlements') ? [path.join(d, e.name)] : []);
    for (const f of walk(root)) {
      const s = fs.readFileSync(f, 'utf8'); const t = s.replace(/\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>/g, '');
      if (t !== s) fs.writeFileSync(f, t);
    }
    return c;
  }]);
  return config;
};
