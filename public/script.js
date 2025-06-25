async function fetchLimitedItem() {
  const assetId = document.getElementById("assetIdInput").value;
  if (!assetId) return alert("Please enter an Asset ID");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Fetching...";

  try {
    // Use roproxy to bypass CORS
    const detailsRes = await fetch(`https://economy.roproxy.com/v2/assets/${assetId}/details`);
    const details = await detailsRes.json();

    // Get thumbnail
    const thumbRes = await fetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const thumbnail = thumbData.data[0]?.imageUrl || "";

    // Render result
    resultDiv.innerHTML = `
      <h2>${details.Name}</h2>
      <img src="${thumbnail}" alt="Item Thumbnail" />
      <p><strong>Creator:</strong> ${details.Creator?.Name || "N/A"}</p>
      <p><strong>Price in Robux:</strong> ${details.PriceInRobux ?? "Offsale"}</p>
      <p><strong>Type:</strong> ${details.AssetTypeDisplayName}</p>
      <p><strong>Is Limited:</strong> ${details.IsLimited ? "✅ True" : "❌ False"}</p>
      <p><strong>Is Limited Unique:</strong> ${details.IsLimitedUnique ? "✅ True" : "❌ False"}</p>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "❌ Failed to fetch item. Make sure the Asset ID is valid.";
  }
}
