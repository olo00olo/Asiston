using Microsoft.AspNetCore.Identity;

namespace Asiston.Database;

public class TreeNode
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? ParentId { get; set; }
}
