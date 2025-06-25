function getAssetTypeName(typeId) {
  const types = {
    1: "Image", 2: "T-Shirt", 3: "Audio", 4: "Mesh", 8: "Hat", 11: "Shirt", 12: "Pants",
    18: "Face", 19: "Gear", 32: "Package", 41: "Hair Accessory", 42: "Face Accessory",
    43: "Neck Accessory", 44: "Shoulder Accessory", 45: "Front Accessory",
    46: "Back Accessory", 47: "Waist Accessory"
  };
  return types[typeId] || "Unknown";
}

async function fetchLimitedItem() {
  const assetId = document.getElementById("assetIdInput").value;
  if (!assetId) return alert("Please enter an Asset ID");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Fetching...";

  try {
    // Fetch item details
    const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
    const details = await detailsRes.json();

    // Fetch thumbnail
    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const thumbnail = thumbData.data[0]?.imageUrl || "";

    // Get resale price
    const resalePrice = details.CollectiblesItemDetails?.CollectibleLowestResalePrice;
    const formattedResale = resalePrice
      ? `${resalePrice.toLocaleString()} Robux`
      : "Offsale";

    const resaleInPHP = resalePrice
      ? `₱${(resalePrice * 0.15).toLocaleString()} PHP`
      : "N/A";

    // Render result
    resultDiv.innerHTML = `
      <h2>${details.Name}</h2>
      <img src="${thumbnail}" alt="Item Thumbnail" />
      <p><strong>Creator:</strong> ${details.Creator?.Name || "N/A"}</p>
      <p><strong>Lowest Resale Price:</strong> ${formattedResale}</p>
      <p><strong>BlackMarket 150PHP/1000RBX:</strong> ${resaleInPHP}</p>
      <p><strong>Type:</strong> ${getAssetTypeName(details.AssetTypeId)}</p>
      <p><strong>Is Limited:</strong> ${details.IsLimited ? "✅ True" : "❌ False"}</p>
      <p><strong>Is Limited Unique:</strong> ${details.IsLimitedUnique ? "✅ True" : "❌ False"}</p>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "❌ Failed to fetch item. Make sure the Asset ID is valid.";
  }
}
