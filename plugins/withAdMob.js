const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withAdMob = (config, { androidAppId, iosAppId }) => {
  // Android configuration
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];

    // Add tools namespace to manifest if not present
    if (!config.modResults.manifest.$) {
      config.modResults.manifest.$ = {};
    }
    config.modResults.manifest.$['xmlns:tools'] =
      'http://schemas.android.com/tools';

    // Add AdMob App ID meta-data
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Remove existing AdMob meta-data if present
    mainApplication['meta-data'] = mainApplication['meta-data'].filter(
      (item) =>
        item.$['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID',
    );

    // Add new AdMob meta-data with tools:replace
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': androidAppId,
        'tools:replace': 'android:value',
      },
    });

    return config;
  });

  // iOS configuration
  config = withInfoPlist(config, (config) => {
    config.modResults.GADApplicationIdentifier = iosAppId;

    // Add SKAdNetwork identifiers for better ad performance
    if (!config.modResults.SKAdNetworkItems) {
      config.modResults.SKAdNetworkItems = [];
    }

    const skAdNetworkIds = [
      'cstr6suwn9.skadnetwork',
      '4fzdc2evr5.skadnetwork',
      '4pfyvq9l8r.skadnetwork',
      '2fnua5tdw4.skadnetwork',
      'ydx93a7ass.skadnetwork',
      '5a6flpkh64.skadnetwork',
      'p78axxw29g.skadnetwork',
      'v72qych5uu.skadnetwork',
      'ludvb6z3bs.skadnetwork',
      'cp8zw746q7.skadnetwork',
      'c6k4g5qg8m.skadnetwork',
      'mlmmfzh3r3.skadnetwork',
      'klf5c3l5u5.skadnetwork',
      'ppxm28t8ap.skadnetwork',
      'ecpz2srf59.skadnetwork',
      'uw77j35x4d.skadnetwork',
      'pwa73g5rt2.skadnetwork',
      '578prtvx9j.skadnetwork',
      '4468km3ulz.skadnetwork',
      '2u9pt9hc89.skadnetwork',
      '8s468mfl3y.skadnetwork',
      'av6w8kgt66.skadnetwork',
      'klf5c3l5u5.skadnetwork',
      'ppxm28t8ap.skadnetwork',
      'hs6bdukanm.skadnetwork',
      'v72qych5uu.skadnetwork',
      'mlmmfzh3r3.skadnetwork',
      '24t9a8vw3c.skadnetwork',
      'wg4vff78zm.skadnetwork',
      'yclnxrl5pm.skadnetwork',
      '4fzdc2evr5.skadnetwork',
      't38b2kh725.skadnetwork',
      '7ug5zh24hu.skadnetwork',
      '9rd848q2bz.skadnetwork',
      'n6fk4nfna4.skadnetwork',
      'kbd757ywx3.skadnetwork',
      '9t245vhmpl.skadnetwork',
      'a2p9lx4jpn.skadnetwork',
      '22mmun2rn5.skadnetwork',
      '3sh42y64q3.skadnetwork',
      'f38h382jlk.skadnetwork',
      'glqzh8vgby.skadnetwork',
      'prcb7njmu6.skadnetwork',
      'wzmmz9fp6w.skadnetwork',
      'ydx93a7ass.skadnetwork',
      '5lm9lj6jb7.skadnetwork',
      'cg4yq2srnc.skadnetwork',
      'v9wttpbfk9.skadnetwork',
      'n38lu8286q.skadnetwork',
      '47vhws6wlr.skadnetwork',
      'kbd757ywx3.skadnetwork',
      '9t245vhmpl.skadnetwork',
      'eh6m2bh4zr.skadnetwork',
      'a2p9lx4jpn.skadnetwork',
      '22mmun2rn5.skadnetwork',
      '4468km3ulz.skadnetwork',
      '2u9pt9hc89.skadnetwork',
      '8s468mfl3y.skadnetwork',
      'glqzh8vgby.skadnetwork',
      'prcb7njmu6.skadnetwork',
      '7ug5zh24hu.skadnetwork',
      '44jx6755aq.skadnetwork',
      '2fnua5tdw4.skadnetwork',
      '4fzdc2evr5.skadnetwork',
      '4pfyvq9l8r.skadnetwork',
      '5a6flpkh64.skadnetwork',
      '8c4e2ghe7u.skadnetwork',
      '9rd848q2bz.skadnetwork',
      'av6w8kgt66.skadnetwork',
      'f38h382jlk.skadnetwork',
      'hs6bdukanm.skadnetwork',
      'ludvb6z3bs.skadnetwork',
      'n6fk4nfna4.skadnetwork',
      'p78axxw29g.skadnetwork',
      'pwa73g5rt2.skadnetwork',
      's39g8k73mm.skadnetwork',
      'wzmmz9fp6w.skadnetwork',
      'yclnxrl5pm.skadnetwork',
      '3qy4746246.skadnetwork',
      '3rd42ekr43.skadnetwork',
      '424m5254lk.skadnetwork',
      '44n7hlldy6.skadnetwork',
      '488r3q3dtq.skadnetwork',
      '4dzt52r2t5.skadnetwork',
      '523jb4fst2.skadnetwork',
      '52fl2v3hgk.skadnetwork',
      '54nzkqm89y.skadnetwork',
      '5l3tpt7t6e.skadnetwork',
      '6g9af3uyq4.skadnetwork',
      '6xzpu9s2p8.skadnetwork',
      '79pbpufp6p.skadnetwork',
      '7rz58n8ntl.skadnetwork',
      '7ug5zh24hu.skadnetwork',
      '84993kbrcf.skadnetwork',
      '89z7zv988g.skadnetwork',
      '8m87ys6875.skadnetwork',
      '9b89h5y424.skadnetwork',
      '9nlqeag3gk.skadnetwork',
      '9yg77x724h.skadnetwork',
      'cj5566h2ga.skadnetwork',
      'feyaarzu9v.skadnetwork',
      'g28c52eehv.skadnetwork',
      'g2y4y55b64.skadnetwork',
      'gta9lk7p23.skadnetwork',
      'hb56zgv37p.skadnetwork',
      'k674qkevps.skadnetwork',
      'kbmxgpxpgc.skadnetwork',
      'm8dbw4sv7c.skadnetwork',
      'mls7yz5dvl.skadnetwork',
      'mtkv5xtk9e.skadnetwork',
      'n9x2a789qt.skadnetwork',
      'pwdxu55a5a.skadnetwork',
      'r45fhb6rf7.skadnetwork',
      'rvh3l7un93.skadnetwork',
      'rx5hdcabgc.skadnetwork',
      'su67r6k2v3.skadnetwork',
      'tl55sbb4fm.skadnetwork',
      'u679fj5vs4.skadnetwork',
      'v4nxqhlyqp.skadnetwork',
      'v79kvwwj4g.skadnetwork',
      'vcra2ehyfk.skadnetwork',
      'w9q455wk68.skadnetwork',
      'x44k69t5bn.skadnetwork',
      'x8jxxk4ff5.skadnetwork',
      'xy9t38ct57.skadnetwork',
      'y45688jllp.skadnetwork',
      'zmvfpc5aq8.skadnetwork',
    ];

    skAdNetworkIds.forEach((id) => {
      const exists = config.modResults.SKAdNetworkItems.some(
        (item) => item.SKAdNetworkIdentifier === id,
      );
      if (!exists) {
        config.modResults.SKAdNetworkItems.push({
          SKAdNetworkIdentifier: id,
        });
      }
    });

    return config;
  });

  return config;
};

module.exports = withAdMob;
