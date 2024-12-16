"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const points_1 = __importDefault(require("./points"));
const faction_1 = __importDefault(require("./faction"));
let Member = class Member {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        unique: true,
    }),
    __metadata("design:type", String)
], Member.prototype, "discordId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Member.prototype, "totalPoints", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Member.prototype, "loggedIn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Number)
], Member.prototype, "pnwID", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => points_1.default, (points) => points.member),
    __metadata("design:type", Array)
], Member.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => faction_1.default, (faction) => faction.members, { onDelete: "CASCADE" }),
    __metadata("design:type", faction_1.default)
], Member.prototype, "faction", void 0);
Member = __decorate([
    (0, typeorm_1.Entity)()
], Member);
exports.default = Member;
