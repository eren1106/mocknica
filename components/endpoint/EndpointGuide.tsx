"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Link, Search, Play } from "lucide-react";

const EndpointGuide = () => {
  const codeExampleClasses =
    "bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto";
  const sectionClasses = "space-y-3";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Getting Started Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-4" />
            Getting Started: Create Your First API
          </CardTitle>
        </CardHeader>
        <CardContent className={sectionClasses}>
          <div>
            <h5 className="font-medium mb-2">
              Step 1: Create a Simple Endpoint
            </h5>
            <p className="text-muted-foreground text-sm mb-3">
              Start by creating a basic endpoint to get familiar with the
              system. Click the &apos;Create Endpoint&apos; button and fill in
              these details:
            </p>
            <div className={codeExampleClasses}>
              <div className="space-y-1">
                <div>
                  <strong>Method:</strong>{" "}
                  <span className="text-green-600 dark:text-green-400">
                    GET
                  </span>
                </div>
                <div>
                  <strong>Path:</strong> /api/users
                </div>
                <div>
                  <strong>Description:</strong> Get all users
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">
              Step 2: Test in Postman (or any HTTP client)
            </h5>
            <p className="text-muted-foreground text-sm mb-2">
              Once your endpoint is created, you can test it using Postman or
              any HTTP client:
            </p>
            <div className={codeExampleClasses}>
              <div className="space-y-1">
                <div>
                  <strong>Method:</strong>{" "}
                  <span className="text-green-600 dark:text-green-400">
                    GET
                  </span>
                </div>
                <div>
                  <strong>URL:</strong> http://your-api-domain.com/api/users
                </div>
                <div>
                  <strong>Headers:</strong> Content-Type: application/json
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Step 3: Add Dynamic Behavior</h5>
            <p className="text-muted-foreground text-sm mb-2">
              Enhance your endpoint with dynamic features:
            </p>
            <div className="space-y-2">
              <div className={codeExampleClasses + " text-sm"}>
                <div>
                  <strong>Path Parameters:</strong> /api/users/:id
                </div>
                <div className="text-xs text-muted-foreground">
                  Get a specific user
                </div>
              </div>
              <div className={codeExampleClasses + " text-sm"}>
                <div>
                  <strong>Query Parameters:</strong>{" "}
                  /api/users?search=john&sortBy=name&order=asc&page=1&limit=10
                </div>
                <div className="text-xs text-muted-foreground">
                  Search, sort, and paginate results using built-in parameters
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
            <p className="text-sm">
              <strong>🎉 Pro Tip:</strong> Query parameters are automatically
              built-in! The system handles parsing and processing them for you -
              no additional setup required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Path Parameters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="size-4" />
            Path Parameters (:id)
          </CardTitle>
        </CardHeader>
        <CardContent className={sectionClasses}>
          <div>
            <h5 className="font-medium mb-2">What are Path Parameters?</h5>
            <p className="text-muted-foreground text-sm mb-3">
              Path parameters are dynamic segments in your URL path, denoted by
              a colon (:) followed by the parameter name. They&apos;re used to
              capture specific values from the URL.
            </p>
          </div>

          <div>
            <h5 className="font-medium mb-2">Example Endpoints:</h5>
            <div className="space-y-2">
              <div className={codeExampleClasses}>
                <div className="text-green-600 dark:text-green-400">GET</div>
                <div>/api/users/:id</div>
              </div>
              <div className={codeExampleClasses}>
                <div className="text-yellow-600 dark:text-yellow-400">POST</div>
                <div>/api/projects/:projectId/endpoints/:endpointId</div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">How to Call These Endpoints:</h5>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Single Parameter:</p>
                <div className={codeExampleClasses}>
                  <div className="space-y-1">
                    <div>
                      GET /api/users/
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        123
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ↳ :id = &quot;123&quot;
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Multiple Parameters:</p>
                <div className={codeExampleClasses}>
                  <div className="space-y-1">
                    <div>
                      POST /api/projects/
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        abc456
                      </span>
                      /endpoints/
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        def789
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ↳ :projectId = &quot;abc456&quot;, :endpointId =
                      &quot;def789&quot;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
            <p className="text-sm">
              <strong>💡 Tip:</strong> Path parameters are required parts of the
              URL. The endpoint won&apos;t match if they&apos;re missing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Query Parameters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-4" />
            Query Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className={sectionClasses}>
          <div>
            <h5 className="font-medium mb-2">What are Query Parameters?</h5>
            <p className="text-muted-foreground text-sm mb-3">
              Query parameters are optional key-value pairs appended to the URL
              after a question mark (?). They&apos;re used for filtering,
              sorting, pagination, and other optional features.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md mb-3">
              <p className="text-sm">
                <strong>✨ Built-in Feature:</strong> These query parameters are
                automatically parsed and available in your endpoints. No
                additional configuration needed - just use them in your API
                calls!
              </p>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Search & Filtering
                </Badge>
                <div className={codeExampleClasses + " text-xs"}>
                  <div><strong>search</strong> - Search through all text fields</div>
                  <div className="text-muted-foreground mt-1">Example: ?search=john</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Sorting
                </Badge>
                <div className={codeExampleClasses + " text-xs"}>
                  <div><strong>sortBy</strong> - Field to sort by (supports nested fields with dot notation)</div>
                  <div><strong>order</strong> - Sort direction: &quot;asc&quot; or &quot;desc&quot;</div>
                  <div className="text-muted-foreground mt-1">Example: ?sortBy=name&order=desc</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Pagination
                </Badge>
                <div className={codeExampleClasses + " text-xs"}>
                  <div><strong>page</strong> - Page number (starts from 1)</div>
                  <div><strong>limit</strong> - Items per page (max: 10,000)</div>
                  <div className="text-muted-foreground mt-1">Example: ?page=2&limit=20</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Example API Calls:</h5>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Search Example:</p>
                <div className={codeExampleClasses}>
                  GET /api/users
                  <span className="text-blue-600 dark:text-blue-400">
                    ?search=john
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Sorting Example:</p>
                <div className={codeExampleClasses}>
                  GET /api/endpoints
                  <span className="text-blue-600 dark:text-blue-400">
                    ?sortBy=name&order=asc
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Pagination Example:</p>
                <div className={codeExampleClasses}>
                  GET /api/users
                  <span className="text-blue-600 dark:text-blue-400">
                    ?page=2&limit=10
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Combined Parameters:</p>
                <div className={codeExampleClasses}>
                  GET /api/endpoints
                  <span className="text-blue-600 dark:text-blue-400">
                    ?search=user&sortBy=createdAt&order=desc&page=1&limit=5
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">
                  With Path Parameters:
                </p>
                <div className={codeExampleClasses}>
                  GET /api/projects/
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    123
                  </span>
                  /endpoints
                  <span className="text-blue-600 dark:text-blue-400">
                    ?search=api&limit=10
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
            <p className="text-sm">
              <strong>💡 Tip:</strong> Query parameters are optional. Your
              endpoint should work without them and provide sensible defaults.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="size-4" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Path Parameters:</h5>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Use for required identifiers (user ID, resource ID)</li>
                <li>
                  • Keep them simple and meaningful (:id, :userId, :projectId)
                </li>
                <li>• Use consistent naming across your API</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-2">Built-in Query Parameters:</h5>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>search</strong>: Searches through all string and number fields automatically</li>
                <li>• <strong>sortBy</strong>: Supports nested field access with dot notation (e.g., &quot;user.name&quot;)</li>
                <li>• <strong>order</strong>: Handles strings, numbers, and dates intelligently</li>
                <li>• <strong>page</strong> & <strong>limit</strong>: Automatic pagination with sensible defaults</li>
                <li>• All parameters are optional and validated automatically</li>
                <li>• No additional setup required - just use them in your API calls</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-2">URL Encoding:</h5>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Always URL-encode special characters in parameters</li>
                <li>• Spaces become %20 or +</li>
                <li>• Special characters like &, =, ? need encoding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>Real-World Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">E-commerce API Example:</h5>
              <div className="space-y-2">
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/products/:productId
                  <div className="text-muted-foreground">
                    Get specific product details
                  </div>
                </div>
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/products?search=electronics&sortBy=price&order=asc&page=1&limit=20
                  <div className="text-muted-foreground">
                    Search products, sort by price, paginated results
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">User Management API Example:</h5>
              <div className="space-y-2">
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/users/:userId/posts
                  <div className="text-muted-foreground">
                    Get posts by specific user
                  </div>
                </div>
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/users?search=john&sortBy=createdAt&order=desc&page=1&limit=10
                  <div className="text-muted-foreground">
                    Search users, sort by creation date, with pagination
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-2">Advanced Sorting Examples:</h5>
              <div className="space-y-2">
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/posts?sortBy=author.name&order=asc
                  <div className="text-muted-foreground">
                    Sort by nested field using dot notation
                  </div>
                </div>
                <div className={codeExampleClasses + " text-xs"}>
                  GET /api/orders?search=pending&sortBy=total&order=desc&limit=50
                  <div className="text-muted-foreground">
                    Search + sort by numeric field + limit results
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndpointGuide;
