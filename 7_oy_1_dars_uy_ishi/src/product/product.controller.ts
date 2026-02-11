import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/createProduct.dto";
import { UpdateProductDto } from "./dto/updateProduct";

@Controller("product")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get("get_all_products")
    getAllProducts() {
        return this.productService.getAllProducts()
    }

    @Post("add_product")
    addProduct(@Body() createProductDto: CreateProductDto) {
        return this.productService.addProduct(createProductDto)
    }

    @Get(":id")
    getOneProduct(@Param("id") id: number) {
        return this.productService.getOneProduct(id)
    }

    @Put("update_item/:id")
    updateProduct(@Param("id") id: number, @Body() updateProductDto: UpdateProductDto) {
        return this.productService.updateProduct(id, updateProductDto)
    }

    @Delete("delete_product/:id")
    deleteProduct(@Param("id") id: number) {
        return this.productService.deleteProduct(id)
    }
}