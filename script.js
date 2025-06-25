
async function fetchLimitedItem() {
  const assetId = document.getElementById("assetIdInput").value;
  if (!assetId) return alert("Please enter an Asset ID");

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Fetching...";

  try {
    const detailsRes = await fetch(`https://economy.roblox.com/v2/assets/${assetId}/details`);
    const details = await detailsRes.json();

    const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=420x420&format=Png`);
    const thumbData = await thumbRes.json();
    const thumbnail = thumbData.data[0]?.imageUrl || "";

    resultDiv.innerHTML = `
      <h2>${details.Name}</h2>
      <img src="${thumbnail}" alt="Item Thumbnail" />
      <p><strong>Creator:</strong> ${details.Creator?.Name || "N/A"}</p>
      <p><strong>Price in Robux:</strong> ${details.PriceInRobux ?? "Offsale"}</p>
      <p><strong>Asset ID:</strong> ${details.AssetId}</p>
      <p><strong>Product ID:</strong> ${details.ProductId}</p>
    `;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "Failed to fetch item. Make sure the Asset ID is valid.";
  }
}
