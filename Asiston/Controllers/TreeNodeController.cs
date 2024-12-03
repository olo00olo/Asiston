using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Asiston.Database;
using Microsoft.AspNetCore.Authorization;

namespace Asiston.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TreeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TreeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tree
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TreeNode>>> GetTree()
        {
            return await _context.TreeNodes.ToListAsync();
        }

        // GET: api/tree/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TreeNode>> GetTreeNode(int id)
        {
            var treeNode = await _context.TreeNodes.FindAsync(id);

            if (treeNode == null)
            {
                return NotFound();
            }

            return treeNode;
        }

        // POST: api/tree
        [HttpPost]
        public async Task<ActionResult<TreeNode>> CreateTreeNode(TreeNode treeNode)
        {
            if (string.IsNullOrWhiteSpace(treeNode.Name))
            {
                return BadRequest("Node name cannot be empty.");
            }

            bool duplicateExists = await _context.TreeNodes
                .AnyAsync(n => n.Name == treeNode.Name && n.ParentId == treeNode.ParentId);

            if (duplicateExists)
            {
                return BadRequest("A node with the same name already exists under the same parent.");
            }

            _context.TreeNodes.Add(treeNode);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTreeNode), new { id = treeNode.Id }, treeNode);
        }


        // PUT: api/tree/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTreeNode(int id, TreeNode treeNode)
        {
            if (id != treeNode.Id)
            {
                return BadRequest();
            }

            // Sprawdzenie, czy istnieje inny węzeł o tej samej nazwie w tym samym parentId
            var existingNode = await _context.TreeNodes
                .FirstOrDefaultAsync(n => n.ParentId == treeNode.ParentId && n.Name == treeNode.Name && n.Id != treeNode.Id);

            if (existingNode != null)
            {
                return BadRequest("A node with the same name already exists under this parent.");
            }

            _context.Entry(treeNode).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tree/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreeNode(int id)
        {
            if (id == 1)
            {
                return BadRequest("The root node cannot be deleted.");
            }

            var treeNode = await _context.TreeNodes.FindAsync(id);
            if (treeNode == null)
            {
                return NotFound();
            }

            await DeleteDescendants(id);

            _context.TreeNodes.Remove(treeNode);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task DeleteDescendants(int parentId)
        {
            var children = await _context.TreeNodes.Where(node => node.ParentId == parentId).ToListAsync();

            foreach (var child in children)
            {
                await DeleteDescendants(child.Id);
                _context.TreeNodes.Remove(child);
            }

            await _context.SaveChangesAsync();
        }
    }
}
