export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;
    
    // If path is / or empty, serve index.html
    if (path === "/" || path === "") {
      path = "/index.html";
    }
    
    try {
      // Fetch the asset from the current origin
      const response = await fetch(new URL(path, request.url));
      if (response.ok) return response;
      
      // If the request fails, try to serve index.html
      if (path !== "/index.html") {
        const indexResponse = await fetch(new URL("/index.html", request.url));
        if (indexResponse.ok) return indexResponse;
      }
    } catch (error) {
      console.error("Error serving file:", error);
    }
    
    // Return a custom 404 page
    return new Response("Not Found", { status: 404 });
  }
};