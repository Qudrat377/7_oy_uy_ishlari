import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/createProduct.dto";
import { UpdateProductDto } from "./dto/updateProduct";

@Injectable()
export class ProductService {
    private products: any = [
        {
            id: 1,
            title: "Apple"
        }
    ]

    async getAllProducts():Promise<CreateProductDto[]> {
        return this.products
    }

    async addProduct(createProductDto: CreateProductDto):Promise<CreateProductDto> {
        this.products.push(createProductDto)
        return createProductDto
    }

    async getOneProduct(id: number):Promise<CreateProductDto> {
        const foundedProduct = this.products.find((product) => product.id === +id)
        if(!foundedProduct) throw new NotFoundException("Product not found")
        return foundedProduct
    }

    async updateProduct(id: number, updateProductDto: UpdateProductDto):Promise<UpdateProductDto> {
        const foundedProduct = this.products.findIndex((product) => product.id === +id)
        if(foundedProduct === -1) throw new NotFoundException("Product not found")
        
        this.products[foundedProduct] = updateProductDto
        return this.products[foundedProduct]
    }
    
    async deleteProduct(id: number):Promise<{message: string}> {
        const foundedProduct = this.products.findIndex((product) => product.id === +id)

        if(foundedProduct === -1) throw new NotFoundException("Product not found")

        this.products.splice(foundedProduct, 1)
        return {message: "Deleted product"}
    }
}