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

            _context.Entry(treeNode).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tree/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTreeNode(int id)
        {
            var treeNode = await _context.TreeNodes.FindAsync(id);
            if (treeNode == null)
            {
                return NotFound();
            }

            _context.TreeNodes.Remove(treeNode);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
