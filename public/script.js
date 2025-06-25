function getAssetTypeName(typeId) {
  const types = {
    1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 5: "Lua", 6: "HTML", 7: "Text",
    8: "Hat", 9: "Place", 10: "Model", 11: "Shirt", 12: "Pants", 13: "Decal",
    17: "Head", 18: "Face", 19: "Gear", 21: "Badge", 24: "Animation",
    27: "Torso", 28: "Right Arm", 29: "Left Arm", 30: "Left Leg", 31: "Right Leg",
    32: "Package", 34: "GamePass", 41: "Hair Accessory", 42: "Face Accessory",
    43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
    46: "Back Accessory", 47: "Waist Accessory", 48: "Climb Animation",
    49: "Death Animation", 50: "Fall Animation", 51: "Idle Animation",
    52: "Jump Animation", 53: "Run Animation", 54: "Swim Animation",
    55: "Walk Animation", 61: "Emote Animation", 62: "Video"
  };
  return types[typeId] || "Unknown";
}

async function fetchLimitedItem() {
  const assetId = document.getElementById("assetIdInput").value;
  if (!assetId) return alert("Please enter an Asset ID");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Fetching...";

  try {
    // Fetch item details via Roproxy
    const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
    const details = await detailsRes.json();

    // Fetch item thumbnail
    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const thumbnail = thumbData.data[0]?.imageUrl || "";

    // Render result
    resultDiv.innerHTML = `
      <h2>${details.Name}</h2>
      <img src="${thumbnail}" alt="Item Thumbnail" />
      <p><strong>Creator:</strong> ${details.Creator?.Name || "N/A"}</p>
      <p><strong>Price in Robux:</strong> ${details.PriceInRobux ?? "Offsale"}</p>
      <p><strong>Type:</strong> ${getAssetTypeName(details.AssetTypeId)}</p>
      <p><strong>Is Limited:</strong> ${details.IsLimited ? "✅ True" : "❌ False"}</p>
      <p><strong>Is Limited Unique:</strong> ${details.IsLimitedUnique ? "✅ True" : "❌ False"}</p>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "❌ Failed to fetch item. Make sure the Asset ID is valid.";
  }
}
