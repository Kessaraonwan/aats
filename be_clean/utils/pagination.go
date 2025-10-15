package utils

import (
    "strconv"

    "github.com/gin-gonic/gin"
)

// ParsePagination reads page and a limit-like query param (limitParam) and
// returns normalized page, limit and offset values. limitParam can be
// "limit", "pageSize" or any other query param that represents page size.
func ParsePagination(c *gin.Context, defaultPage, defaultLimit, maxLimit int, limitParam string) (int, int, int) {
    pageStr := c.DefaultQuery("page", "1")
    limitStr := c.DefaultQuery(limitParam, strconv.Itoa(defaultLimit))

    page, err := strconv.Atoi(pageStr)
    if err != nil || page < 1 {
        page = defaultPage
    }
    limit, err := strconv.Atoi(limitStr)
    if err != nil || limit < 1 {
        limit = defaultLimit
    }
    if limit > maxLimit {
        limit = maxLimit
    }
    offset := (page - 1) * limit
    return page, limit, offset
}
